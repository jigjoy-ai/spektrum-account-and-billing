import { describe, it, expect, beforeEach } from "@rstest/core"
import { SendMagicLinkChallenge } from "@app/use-cases/send-magic-link-challenge"
import { InMemoryIdentityManagementService } from "@app/test/mocks/in-memory-identity-management-service"
import { InMemoryEmailSender } from "@app/test/mocks/in-memory-email-sender"
import { InMemoryOrganizationRepository } from "@app/test/mocks/in-memory-organization-repository"

describe("Send Magic Link Challenge UseCase", () => {
	let sendMagicLinkChallengeUseCase: SendMagicLinkChallenge
	let identityManagementService: InMemoryIdentityManagementService
	let emailSender: InMemoryEmailSender
	let organizationRepository: InMemoryOrganizationRepository
	const destinationUrl = "https://example.com/login"
	const fromAddress = "noreply@example.com"

	beforeEach(() => {
		identityManagementService = new InMemoryIdentityManagementService()
		emailSender = new InMemoryEmailSender()
		organizationRepository = new InMemoryOrganizationRepository()
		sendMagicLinkChallengeUseCase = new SendMagicLinkChallenge(
			emailSender,
			identityManagementService,
			organizationRepository,
			fromAddress,
			destinationUrl,
		)
	})

	it("should successfully send magic link for existing user", async () => {
		// Arrange
		const userEmail = "user@example.com"
		const user = await identityManagementService.create(userEmail)

		// Act
		await sendMagicLinkChallengeUseCase.execute(userEmail)

		// Assert
		const sentEmails = emailSender.getSentEmails()
		expect(sentEmails).toHaveLength(1)

		const sentEmail = sentEmails[0]
		expect(sentEmail.getRecipient()).toBe(user.getId())
		expect(sentEmail.getSender()).toBe(fromAddress)
		expect(sentEmail.getSubject()).toBe("JigJoy Login Link")
		expect(sentEmail.getBody()).toContain(destinationUrl)

		const challengeToken = identityManagementService.getChallengeToken(user.getId())
		expect(challengeToken).toBeDefined()
	})

	it("should create user and organization and send magic link for new user", async () => {
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

		// Verify organization was created
		const user = await identityManagementService.get(userEmail)
		expect(user).toBeDefined()
		const organization = await organizationRepository.getByOwnerId(user!.getId())
		expect(organization).toBeDefined()
		expect(organization!.getOwnerId()).toBe(user!.getId())
		expect(organization!.getRemainingCredits()).toBe(5) // Free credits

		const sentEmails = emailSender.getSentEmails()
		expect(sentEmails).toHaveLength(1)

		const sentEmail = sentEmails[0]
		expect(sentEmail.getRecipient()).toBe(user!.getId())
	})

	it("should issue auth challenge when sending magic link", async () => {
		// Arrange
		const userEmail = "user@example.com"
		const user = await identityManagementService.create(userEmail)

		// Act
		await sendMagicLinkChallengeUseCase.execute(userEmail)

		// Assert
		const challengeToken = identityManagementService.getChallengeToken(user.getId())
		expect(challengeToken).toBeDefined()
		expect(typeof challengeToken).toBe("string")
		expect(challengeToken!.length).toBeGreaterThan(0)
	})

	it("should throw an error when organizationRepository.save fails", async () => {
		// Arrange
		const userEmail = "newuser@example.com"
		organizationRepository.setShouldFailOnSave(true, new Error("Database connection failed"))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow("Database connection failed")
	})

	it("should throw an error when identityManagementService.createUser fails", async () => {
		// Arrange
		const userEmail = "newuser@example.com"
		const errorMessage = "Failed to create user"
		identityManagementService.setShouldFailOnCreateUser(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
	})

	it("should throw an error when identityManagementService.issueAuthChallenge fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.create(userEmail)

		const errorMessage = "Failed to issue auth challenge"
		identityManagementService.setShouldFailOnIssueAuthChallenge(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
	})

	it("should throw an error when emailSender.sendEmail fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.create(userEmail)

		const errorMessage = "Email service unavailable"
		emailSender.setShouldFail(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
	})

	it("should not send email if user creation fails", async () => {
		// Arrange
		const userEmail = "newuser@example.com"
		const errorMessage = "Failed to create user"
		identityManagementService.setShouldFailOnCreateUser(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow(errorMessage)

		const sentEmails = emailSender.getSentEmails()
		expect(sentEmails).toHaveLength(0)
	})

	it("should not send email if auth challenge issuance fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.create(userEmail)

		const errorMessage = "Failed to issue auth challenge"
		identityManagementService.setShouldFailOnIssueAuthChallenge(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow(errorMessage)

		const sentEmails = emailSender.getSentEmails()
		expect(sentEmails).toHaveLength(0)
	})

	it("should generate unique challenge tokens for different users", async () => {
		// Arrange
		const userEmail1 = "user1@example.com"
		const userEmail2 = "user2@example.com"
		const user1 = await identityManagementService.create(userEmail1)
		const user2 = await identityManagementService.create(userEmail2)

		// Act
		await sendMagicLinkChallengeUseCase.execute(userEmail1)
		await sendMagicLinkChallengeUseCase.execute(userEmail2)

		// Assert
		const challengeToken1 = identityManagementService.getChallengeToken(user1.getId())
		const challengeToken2 = identityManagementService.getChallengeToken(user2.getId())

		expect(challengeToken1).toBeDefined()
		expect(challengeToken2).toBeDefined()
		expect(challengeToken1).not.toBe(challengeToken2)
	})

	it("should generate new challenge token when sending magic link multiple times for same user", async () => {
		// Arrange
		const userEmail = "user@example.com"
		const user = await identityManagementService.create(userEmail)

		// Act
		await sendMagicLinkChallengeUseCase.execute(userEmail)
		const firstChallengeToken = identityManagementService.getChallengeToken(user.getId())

		// Add a small delay to ensure different timestamps
		await new Promise((resolve) => setTimeout(resolve, 10))

		await sendMagicLinkChallengeUseCase.execute(userEmail)
		const secondChallengeToken = identityManagementService.getChallengeToken(user.getId())

		// Assert
		expect(firstChallengeToken).toBeDefined()
		expect(secondChallengeToken).toBeDefined()
		expect(firstChallengeToken).not.toBe(secondChallengeToken)

		const sentEmails = emailSender.getSentEmails()
		expect(sentEmails).toHaveLength(2)
	})
})
