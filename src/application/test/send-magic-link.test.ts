import { describe, it, expect, beforeEach } from "@rstest/core"
import { SendMagicLink } from "@app/use-cases/send-magic-link"
import { InMemoryAccountStore } from "@app/test/mocks/in-memory-account-store"
import { InMemoryEmailSender } from "@app/test/mocks/in-memory-email-sender"
import { InMemoryTokenService } from "@app/test/mocks/in-memory-token-service"
import { MagicLinkService } from "@app/services/magic-link-service"
import { AccountStore } from "@app/ports/repositories/account-store"
import { EmailSender } from "@app/ports/services/email-sender"
import { TokenService } from "@app/ports/services/token-service"
import { Account } from "@domain/account"

describe("Send Magic Link", () => {
	let sendMagicLinkUseCase: SendMagicLink
	let accountStore: AccountStore
	let emailSender: EmailSender
	let tokenService: TokenService
	let magicLinkService: MagicLinkService
	const destinationUrl = "https://example.com/login"
	const fromAddress = "noreply@example.com"

	beforeEach(() => {
		accountStore = new InMemoryAccountStore()
		emailSender = new InMemoryEmailSender()
		tokenService = new InMemoryTokenService()
		magicLinkService = new MagicLinkService(tokenService, destinationUrl)
		sendMagicLinkUseCase = new SendMagicLink(
			emailSender,
			accountStore,
			magicLinkService,
			fromAddress,
		)
	})

	it("should successfully send magic link for existing account", async () => {
		// Arrange
		const userEmail = "user@example.com"
		const account = Account.create(userEmail)
		await accountStore.create(account)

		// Act
		await sendMagicLinkUseCase.execute(userEmail)

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

		const inMemoryAccountStore = accountStore as InMemoryAccountStore
		const authChallenge = inMemoryAccountStore.getAuthChallenge(userEmail)
		expect(authChallenge).toBeDefined()
	})

	it("should create account and send magic link for new user", async () => {
		// Arrange
		const userEmail = "newuser@example.com"
		const inMemoryAccountStore = accountStore as InMemoryAccountStore

		// Verify account doesn't exist
		expect(inMemoryAccountStore.hasAccount(userEmail)).toBe(false)

		// Act
		await sendMagicLinkUseCase.execute(userEmail)

		// Assert
		expect(inMemoryAccountStore.hasAccount(userEmail)).toBe(true)

		const account = await accountStore.findByEmail(userEmail)
		expect(account).not.toBeNull()
		expect(account?.getEmail()).toBe(userEmail)

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
		await sendMagicLinkUseCase.execute(userEmail)

		// Assert
		const inMemoryAccountStore = accountStore as InMemoryAccountStore
		const authChallenge = inMemoryAccountStore.getAuthChallenge(userEmail)
		expect(authChallenge).toBeDefined()
		expect(typeof authChallenge).toBe("string")
		expect(authChallenge!.length).toBeGreaterThan(0)
	})

	it("should throw an error when accountStore.findByEmail fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		const errorMessage = "Database connection failed"
		const inMemoryAccountStore = accountStore as InMemoryAccountStore
		inMemoryAccountStore.setShouldFailOnFindByEmail(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
	})

	it("should throw an error when accountStore.create fails", async () => {
		// Arrange
		const userEmail = "newuser@example.com"
		const errorMessage = "Failed to create account"
		const inMemoryAccountStore = accountStore as InMemoryAccountStore
		inMemoryAccountStore.setShouldFailOnCreate(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
	})

	it("should throw an error when accountStore.setAuthChallenge fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		const account = Account.create(userEmail)
		await accountStore.create(account)

		const errorMessage = "Failed to set auth challenge"
		const inMemoryAccountStore = accountStore as InMemoryAccountStore
		inMemoryAccountStore.setShouldFailOnSetAuthChallenge(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
	})

	it("should throw an error when tokenService.generateToken fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		const account = Account.create(userEmail)
		await accountStore.create(account)

		const errorMessage = "Token generation failed"
		const inMemoryTokenService = tokenService as InMemoryTokenService
		inMemoryTokenService.setShouldFailOnGenerateToken(true, new Error(errorMessage))

		// Recreate use case with failing token service
		const failingMagicLinkService = new MagicLinkService(inMemoryTokenService, destinationUrl)
		const failingUseCase = new SendMagicLink(
			emailSender,
			accountStore,
			failingMagicLinkService,
			fromAddress,
		)

		// Act & Assert
		await expect(failingUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
	})

	it("should throw an error when emailSender.sendEmail fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		const account = Account.create(userEmail)
		await accountStore.create(account)

		const errorMessage = "Email service unavailable"
		const inMemoryEmailSender = emailSender as InMemoryEmailSender
		inMemoryEmailSender.setShouldFail(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkUseCase.execute(userEmail)).rejects.toThrow(errorMessage)
	})

	it("should not send email if account creation fails", async () => {
		// Arrange
		const userEmail = "newuser@example.com"
		const errorMessage = "Failed to create account"
		const inMemoryAccountStore = accountStore as InMemoryAccountStore
		inMemoryAccountStore.setShouldFailOnCreate(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkUseCase.execute(userEmail)).rejects.toThrow(errorMessage)

		const inMemoryEmailSender = emailSender as InMemoryEmailSender
		const sentEmails = inMemoryEmailSender.getSentEmails()
		expect(sentEmails).toHaveLength(0)
	})

	it("should not send email if auth challenge setting fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		const account = Account.create(userEmail)
		await accountStore.create(account)

		const errorMessage = "Failed to set auth challenge"
		const inMemoryAccountStore = accountStore as InMemoryAccountStore
		inMemoryAccountStore.setShouldFailOnSetAuthChallenge(true, new Error(errorMessage))

		// Act & Assert
		await expect(sendMagicLinkUseCase.execute(userEmail)).rejects.toThrow(errorMessage)

		const inMemoryEmailSender = emailSender as InMemoryEmailSender
		const sentEmails = inMemoryEmailSender.getSentEmails()
		expect(sentEmails).toHaveLength(0)
	})

	it("should generate unique tokens for different users", async () => {
		// Arrange
		const userEmail1 = "user1@example.com"
		const userEmail2 = "user2@example.com"

		// Act
		await sendMagicLinkUseCase.execute(userEmail1)
		await sendMagicLinkUseCase.execute(userEmail2)

		// Assert
		const inMemoryAccountStore = accountStore as InMemoryAccountStore
		const authChallenge1 = inMemoryAccountStore.getAuthChallenge(userEmail1)
		const authChallenge2 = inMemoryAccountStore.getAuthChallenge(userEmail2)

		expect(authChallenge1).toBeDefined()
		expect(authChallenge2).toBeDefined()
		expect(authChallenge1).not.toBe(authChallenge2)
	})

	it("should generate new token when sending magic link multiple times for same user", async () => {
		// Arrange
		const userEmail = "user@example.com"
		const account = Account.create(userEmail)
		await accountStore.create(account)

		// Act
		await sendMagicLinkUseCase.execute(userEmail)
		const firstAuthChallenge = (accountStore as InMemoryAccountStore).getAuthChallenge(userEmail)

		await sendMagicLinkUseCase.execute(userEmail)
		const secondAuthChallenge = (accountStore as InMemoryAccountStore).getAuthChallenge(userEmail)

		// Assert
		expect(firstAuthChallenge).toBeDefined()
		expect(secondAuthChallenge).toBeDefined()
		expect(firstAuthChallenge).not.toBe(secondAuthChallenge)

		const inMemoryEmailSender = emailSender as InMemoryEmailSender
		const sentEmails = inMemoryEmailSender.getSentEmails()
		expect(sentEmails).toHaveLength(2)
	})
})
