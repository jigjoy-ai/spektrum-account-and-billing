import { describe, it, expect, beforeEach } from "@rstest/core"
import { SendMagicLinkChallenge } from "@app/use-cases/send-magic-link-challenge"
import { InMemoryIdentityManagementService } from "@app/test/mocks/in-memory-identity-management-service"
import { InMemoryEmailSender } from "@app/test/mocks/in-memory-email-sender"
import { InMemoryTokenService } from "@app/test/mocks/in-memory-token-service"
import { MagicLinkService } from "@app/services/magic-link-service"
import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { EmailSender } from "@app/ports/services/email-sender"
import { TokenService } from "@app/ports/services/token-service"

describe("Send Magic Link", () => {
	let sendMagicLinkChallengeUseCase: SendMagicLinkChallenge
	let identityManagementService: IdentityManagementService
	let emailSender: EmailSender
	let tokenService: TokenService
	let magicLinkService: MagicLinkService
	const destinationUrl = "https://example.com/login"
	const fromAddress = "noreply@example.com"

	beforeEach(() => {
		identityManagementService = new InMemoryIdentityManagementService()
		emailSender = new InMemoryEmailSender()
		tokenService = new InMemoryTokenService()
		magicLinkService = new MagicLinkService(tokenService, destinationUrl)
		sendMagicLinkChallengeUseCase = new SendMagicLinkChallenge(
			emailSender,
			identityManagementService,
			magicLinkService,
			fromAddress,
		)
	})

	it("should successfully send magic link for existing account", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.createUser(userEmail)

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
		expect(sentEmail.getBody()).toContain(userEmail)

		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		const authToken = inMemoryIdentityService.getAuthToken(userEmail)
		expect(authToken).toBeDefined()
	})

	it("should create user and send magic link for new user", async () => {
		// Arrange
		const userEmail = "newuser@example.com"

		// Verify user doesn't exist before sending magic link
		const userDoesNotExist = await identityManagementService.hasUser(userEmail)
		expect(userDoesNotExist).toBe(false)

		// Act
		await sendMagicLinkChallengeUseCase.execute(userEmail)

		// Assert

		const userExists = await identityManagementService.hasUser(userEmail)
		expect(userExists).toBe(true)

		const inMemoryEmailSender = emailSender as InMemoryEmailSender
		const sentEmails = inMemoryEmailSender.getSentEmails()
		expect(sentEmails).toHaveLength(1)

		const sentEmail = sentEmails[0]
		expect(sentEmail.getRecipient()).toBe(userEmail)
	})

	it("should set auth challenge when sending magic link", async () => {
		// Arrange
		const userEmail = "user@example.com"

		// Act
		await sendMagicLinkChallengeUseCase.execute(userEmail)

		// Assert
		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		const authToken = inMemoryIdentityService.getAuthToken(userEmail)
		expect(authToken).toBeDefined()
		expect(typeof authToken).toBe("string")
		expect(authToken!.length).toBeGreaterThan(0)
	})

	it("should throw an error when identityManagementService.isUserExists fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		const errorMessage = "Database connection failed"
		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		inMemoryIdentityService.setShouldFailOnIsUserExists(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
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

	it("should throw an error when identityManagementService.setAuthChallenge fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.createUser(userEmail)

		const errorMessage = "Failed to set auth challenge"
		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		inMemoryIdentityService.setShouldFailOnSetAuthToken(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
	})

	it("should throw an error when tokenService.generateToken fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.createUser(userEmail)

		const errorMessage = "Token generation failed"
		const inMemoryTokenService = tokenService as InMemoryTokenService
		inMemoryTokenService.setShouldFailOnGenerateToken(true, new Error(errorMessage))

		// Recreate use case with failing token service
		const failingMagicLinkService = new MagicLinkService(inMemoryTokenService, destinationUrl)
		const failingUseCase = new SendMagicLinkChallenge(
			emailSender,
			identityManagementService,
			failingMagicLinkService,
			fromAddress,
		)

		// Act & Assert
		await expect(failingUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
	})

	it("should throw an error when emailSender.sendEmail fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.createUser(userEmail)

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

	it("should not send email if auth challenge setting fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.createUser(userEmail)

		const errorMessage = "Failed to set auth challenge"
		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		inMemoryIdentityService.setShouldFailOnSetAuthToken(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkChallengeUseCase.execute(userEmail)).rejects.toThrow(errorMessage)

		const inMemoryEmailSender = emailSender as InMemoryEmailSender
		const sentEmails = inMemoryEmailSender.getSentEmails()
		expect(sentEmails).toHaveLength(0)
	})

	it("should generate unique tokens for different users", async () => {
		// Arrange
		const userEmail1 = "user1@example.com"
		const userEmail2 = "user2@example.com"

		// Act
		await sendMagicLinkChallengeUseCase.execute(userEmail1)
		await sendMagicLinkChallengeUseCase.execute(userEmail2)

		// Assert
		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		const authToken1 = inMemoryIdentityService.getAuthToken(userEmail1)
		const authToken2 = inMemoryIdentityService.getAuthToken(userEmail2)

		expect(authToken1).toBeDefined()
		expect(authToken2).toBeDefined()
		expect(authToken1).not.toBe(authToken2)
	})

	it("should generate new token when sending magic link multiple times for same user", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.createUser(userEmail)

		// Act
		await sendMagicLinkChallengeUseCase.execute(userEmail)
		const firstAuthToken = (identityManagementService as InMemoryIdentityManagementService).getAuthToken(userEmail)

		await sendMagicLinkChallengeUseCase.execute(userEmail)
		const secondAuthToken = (identityManagementService as InMemoryIdentityManagementService).getAuthToken(userEmail)

		// Assert
		expect(firstAuthToken).toBeDefined()
		expect(secondAuthToken).toBeDefined()
		expect(firstAuthToken).not.toBe(secondAuthToken)

		const inMemoryEmailSender = emailSender as InMemoryEmailSender
		const sentEmails = inMemoryEmailSender.getSentEmails()
		expect(sentEmails).toHaveLength(2)
	})
})
