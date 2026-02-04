import { describe, it, expect, beforeEach } from "@rstest/core"
import { SendMagicLinkChallenge } from "@app/use-cases/send-magic-link-challenge"
import { InMemoryIdentityManagementService } from "@app/test/mocks/in-memory-identity-management-service"
import { InMemoryEmailSender } from "@app/test/mocks/in-memory-email-sender"
import { InMemoryAccountService } from "@app/test/mocks/in-memory-account-service"
import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { EmailSender } from "@app/ports/services/email-sender"
import { AccountService } from "@app/ports/services/account-service"

describe("Send Magic Link Challenge UseCase", () => {
	let sendMagicLinkChallengeUseCase: SendMagicLinkChallenge
	let identityManagementService: IdentityManagementService
	let emailSender: EmailSender
	let accountService: AccountService
	const destinationUrl = "https://example.com/login"
	const fromAddress = "noreply@example.com"

	beforeEach(() => {
		identityManagementService = new InMemoryIdentityManagementService()
		emailSender = new InMemoryEmailSender()
		accountService = new InMemoryAccountService(identityManagementService)
		sendMagicLinkChallengeUseCase = new SendMagicLinkChallenge(
			emailSender,
			identityManagementService,
			accountService,
			fromAddress,
			destinationUrl,
		)
	})

	it("should successfully send magic link for existing account", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.create(userEmail)

		// Act
		await sendMagicLinkChallengeUseCase.execute(userEmail)

		// Assert
		const inMemoryEmailSender = emailSender as InMemoryEmailSender
		const sentEmails = inMemoryEmailSender.getSentEmails()
		expect(sentEmails).toHaveLength(1)

		const sentEmail = sentEmails[0]
		expect(sentEmail.getRecipient()).toBe(userEmail)
		expect(sentEmail.getSender()).toBe(fromAddress)
		expect(sentEmail.getSubject()).toBe("JigJoy Login Link")
		expect(sentEmail.getBody()).toContain(destinationUrl)

		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		const challengeToken = inMemoryIdentityService.getChallengeToken(userEmail)
		expect(challengeToken).toBeDefined()
	})

	it("should create user and send magic link for new user", async () => {
		// Arrange
		const userEmail = "newuser@example.com"

		// Verify user doesn't exist before sending magic link
		const userDoesNotExist = await identityManagementService.exists(userEmail)
		expect(userDoesNotExist).toBe(false)

		// Act
		await sendMagicLinkChallengeUseCase.execute(userEmail)

		// Assert

		const userExists = await identityManagementService.exists(userEmail)
		expect(userExists).toBe(true)

		const inMemoryEmailSender = emailSender as InMemoryEmailSender
		const sentEmails = inMemoryEmailSender.getSentEmails()
		expect(sentEmails).toHaveLength(1)

		const sentEmail = sentEmails[0]
		expect(sentEmail.getRecipient()).toBe(userEmail)
	})

	it("should issue auth challenge when sending magic link", async () => {
		// Arrange
		const userEmail = "user@example.com"

		// Act
		await sendMagicLinkChallengeUseCase.execute(userEmail)

		// Assert
		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		const challengeToken = inMemoryIdentityService.getChallengeToken(userEmail)
		expect(challengeToken).toBeDefined()
		expect(typeof challengeToken).toBe("string")
		expect(challengeToken!.length).toBeGreaterThan(0)
	})

	it("should throw an error when accountService.getAccount fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		const inMemoryAccountService = accountService as InMemoryAccountService
		inMemoryAccountService.setShouldFailOnGetAccount(true, new Error("Database connection failed"))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow()
	})

	it("should throw an error when identityManagementService.createUser fails", async () => {
		// Arrange
		const userEmail = "newuser@example.com"
		const errorMessage = "Failed to create account"
		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		inMemoryIdentityService.setShouldFailOnCreateUser(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
	})

	it("should throw an error when identityManagementService.issueAuthChallenge fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.create(userEmail)

		const errorMessage = "Failed to issue auth challenge"
		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		inMemoryIdentityService.setShouldFailOnIssueAuthChallenge(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
	})

	it("should throw an error when emailSender.sendEmail fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.create(userEmail)

		const errorMessage = "Email service unavailable"
		const inMemoryEmailSender = emailSender as InMemoryEmailSender
		inMemoryEmailSender.setShouldFail(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
	})

	it("should not send email if account creation fails", async () => {
		// Arrange
		const userEmail = "newuser@example.com"
		const errorMessage = "Failed to create account"
		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		inMemoryIdentityService.setShouldFailOnCreateUser(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow(errorMessage)

		const inMemoryEmailSender = emailSender as InMemoryEmailSender
		const sentEmails = inMemoryEmailSender.getSentEmails()
		expect(sentEmails).toHaveLength(0)
	})

	it("should not send email if auth challenge issuance fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.create(userEmail)

		const errorMessage = "Failed to issue auth challenge"
		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		inMemoryIdentityService.setShouldFailOnIssueAuthChallenge(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow(errorMessage)

		const inMemoryEmailSender = emailSender as InMemoryEmailSender
		const sentEmails = inMemoryEmailSender.getSentEmails()
		expect(sentEmails).toHaveLength(0)
	})

	it("should generate unique challenge tokens for different users", async () => {
		// Arrange
		const userEmail1 = "user1@example.com"
		const userEmail2 = "user2@example.com"

		// Act
		await sendMagicLinkChallengeUseCase.execute(userEmail1)
		await sendMagicLinkChallengeUseCase.execute(userEmail2)

		// Assert
		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		const challengeToken1 = inMemoryIdentityService.getChallengeToken(userEmail1)
		const challengeToken2 = inMemoryIdentityService.getChallengeToken(userEmail2)

		expect(challengeToken1).toBeDefined()
		expect(challengeToken2).toBeDefined()
		expect(challengeToken1).not.toBe(challengeToken2)
	})

	it("should generate new challenge token when sending magic link multiple times for same user", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.create(userEmail)

		// Act
		await sendMagicLinkChallengeUseCase.execute(userEmail)
		const firstChallengeToken = (identityManagementService as InMemoryIdentityManagementService).getChallengeToken(
			userEmail,
		)

		// Add a small delay to ensure different timestamps
		await new Promise((resolve) => setTimeout(resolve, 10))

		await sendMagicLinkChallengeUseCase.execute(userEmail)
		const secondChallengeToken = (identityManagementService as InMemoryIdentityManagementService).getChallengeToken(
			userEmail,
		)

		// Assert
		expect(firstChallengeToken).toBeDefined()
		expect(secondChallengeToken).toBeDefined()
		expect(firstChallengeToken).not.toBe(secondChallengeToken)

		const inMemoryEmailSender = emailSender as InMemoryEmailSender
		const sentEmails = inMemoryEmailSender.getSentEmails()
		expect(sentEmails).toHaveLength(2)
	})
})
