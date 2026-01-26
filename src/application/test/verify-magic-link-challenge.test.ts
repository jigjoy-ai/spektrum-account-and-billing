import { describe, it, expect, beforeEach } from "@rstest/core"
import { VerifyMagicLinkChallenge } from "@app/use-cases/verify-magic-link-challenge"
import { InMemoryIdentityManagementService } from "@app/test/mocks/in-memory-identity-management-service"
import { IdentityManagementService } from "@app/ports/services/identity-management-service"

describe("Verify Magic Link Challenge UseCase", () => {
	let verifyMagicLinkChallengeUseCase: VerifyMagicLinkChallenge
	let identityManagementService: IdentityManagementService

	beforeEach(() => {
		identityManagementService = new InMemoryIdentityManagementService()
		verifyMagicLinkChallengeUseCase = new VerifyMagicLinkChallenge(identityManagementService)
	})

	it("should successfully verify magic link challenge for existing user with valid challenge", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.createUser(userEmail)
		const challengeToken = await identityManagementService.issueAuthChallenge(userEmail, 5)

		// Act
		const accessToken = await verifyMagicLinkChallengeUseCase.execute(userEmail, challengeToken)

		// Assert - Should return an access token
		expect(accessToken).toBeDefined()
		expect(typeof accessToken).toBe("string")
		expect(accessToken).toContain("session-")
	})

	it("should throw an error when user does not exist", async () => {
		// Arrange
		const userEmail = "nonexistent@example.com"
		const challengeToken = "some-challenge-token"

		// Verify user doesn't exist
		const userDoesNotExist = await identityManagementService.hasUser(userEmail)
		expect(userDoesNotExist).toBe(false)

		// Act & Assert
		await expect(verifyMagicLinkChallengeUseCase.execute(userEmail, challengeToken)).rejects.toThrow(
			"User does not exist. Please request a new magic link.",
		)
	})

	it("should throw an error when identityManagementService.hasUser fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		const challengeToken = "some-challenge-token"
		const errorMessage = "Database connection failed"
		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		inMemoryIdentityService.setShouldFailOnHasUser(true, new Error(errorMessage))

		// Act & Assert
		await expect(verifyMagicLinkChallengeUseCase.execute(userEmail, challengeToken)).rejects.toThrow(errorMessage)
	})

	it("should throw an error when identityManagementService.verifyAuthChallenge fails", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.createUser(userEmail)
		const challengeToken = await identityManagementService.issueAuthChallenge(userEmail, 5)

		const errorMessage = "Failed to verify auth challenge"
		const inMemoryIdentityService = identityManagementService as InMemoryIdentityManagementService
		inMemoryIdentityService.setShouldFailOnVerifyAuthChallenge(true, new Error(errorMessage))

		// Act & Assert
		await expect(verifyMagicLinkChallengeUseCase.execute(userEmail, challengeToken)).rejects.toThrow(errorMessage)
	})

	it("should throw an error when challenge is invalid", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.createUser(userEmail)
		const invalidChallengeToken = "invalid-challenge-token"

		// Act & Assert
		await expect(verifyMagicLinkChallengeUseCase.execute(userEmail, invalidChallengeToken)).rejects.toThrow(
			"Invalid challenge",
		)
	})

	it("should throw an error when challenge is expired", async () => {
		// Arrange
		const userEmail = "user@example.com"
		await identityManagementService.createUser(userEmail)

		// Issue a challenge with 0 minutes expiration (expired immediately)
		const challengeToken = await identityManagementService.issueAuthChallenge(userEmail, 0)

		// Wait a bit to ensure expiration
		await new Promise((resolve) => setTimeout(resolve, 10))

		// Act & Assert
		await expect(verifyMagicLinkChallengeUseCase.execute(userEmail, challengeToken)).rejects.toThrow(
			"Challenge expired",
		)
	})

	it("should verify challenge for different users independently", async () => {
		// Arrange
		const userEmail1 = "user1@example.com"
		const userEmail2 = "user2@example.com"

		await identityManagementService.createUser(userEmail1)
		await identityManagementService.createUser(userEmail2)

		const challengeToken1 = await identityManagementService.issueAuthChallenge(userEmail1, 5)
		const challengeToken2 = await identityManagementService.issueAuthChallenge(userEmail2, 5)

		// Act
		const accessToken1 = await verifyMagicLinkChallengeUseCase.execute(userEmail1, challengeToken1)
		const accessToken2 = await verifyMagicLinkChallengeUseCase.execute(userEmail2, challengeToken2)

		// Assert - Both should return access tokens
		expect(accessToken1).toBeDefined()
		expect(accessToken2).toBeDefined()
		expect(typeof accessToken1).toBe("string")
		expect(typeof accessToken2).toBe("string")
	})

	it("should not verify challenge with wrong user email", async () => {
		// Arrange
		const userEmail1 = "user1@example.com"
		const userEmail2 = "user2@example.com"

		await identityManagementService.createUser(userEmail1)
		await identityManagementService.createUser(userEmail2)

		const challengeToken1 = await identityManagementService.issueAuthChallenge(userEmail1, 5)

		// Act & Assert - Using challengeToken1 with userEmail2 should fail
		await expect(verifyMagicLinkChallengeUseCase.execute(userEmail2, challengeToken1)).rejects.toThrow(
			"Invalid challenge",
		)
	})
})
