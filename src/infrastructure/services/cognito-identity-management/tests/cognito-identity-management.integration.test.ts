import { describe, it, expect, beforeEach, afterEach } from "@rstest/core"
import {
	CognitoIdentityProviderClient,
	AdminDeleteUserCommand,
	AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import { CognitoIdentityManagementService } from "@infra/services/cognito-identity-management/cognito-identity-management"
import { AuthSession } from "@domain/auth-session"

describe("Cognito Identity Management Service Integration", () => {
	let identityManagementService: CognitoIdentityManagementService
	let cognitoClient: CognitoIdentityProviderClient
	const testEmails: string[] = []

	const userPoolId = process.env.USER_POOL_ID as string
	const userPoolClientId = process.env.USER_POOL_CLIENT_ID as string
	beforeEach(() => {
		cognitoClient = new CognitoIdentityProviderClient({
			region: process.env.AWS_REGION,
			profile: process.env.AWS_PROFILE,
		})
		identityManagementService = new CognitoIdentityManagementService(userPoolId, userPoolClientId)
	})

	afterEach(async () => {
		// Clean up test users from Cognito
		for (const email of testEmails) {
			try {
				await cognitoClient.send(
					new AdminDeleteUserCommand({
						UserPoolId: userPoolId,
						Username: email,
					}),
				)
			} catch (error) {
				console.error(`Failed to delete test user with email ${email}:`, error)
			}
		}
		testEmails.length = 0
	})

	it("should return false when finding a non-existent user", async () => {
		const nonExistentEmail = `test-nonexistent-${Date.now()}@example.com`

		const result = await identityManagementService.exists(nonExistentEmail)

		expect(result).toBe(false)
	})

	it("should create a user in Cognito", async () => {
		const email = `test-create-${Date.now()}@example.com`
		testEmails.push(email)

		await identityManagementService.create(email)

		// Verify user was created by fetching from Cognito
		const getUserCommand = new AdminGetUserCommand({
			UserPoolId: userPoolId,
			Username: email,
		})
		const user = await cognitoClient.send(getUserCommand)

		expect(user).toBeDefined()
		// When email is used as username attribute, the email is in UserAttributes, not Username
		const emailAttribute = user.UserAttributes?.find((attr) => attr.Name === "email")
		expect(emailAttribute?.Value).toBe(email)
	})

	it("should find a user after creating it", async () => {
		const email = `test-find-${Date.now()}@example.com`
		testEmails.push(email)

		await identityManagementService.create(email)
		const found = await identityManagementService.exists(email)

		expect(found).toBe(true)
	})

	it("should issue auth challenge for a user", async () => {
		const email = `test-challenge-${Date.now()}@example.com`
		const expirationInMinutes = 15
		testEmails.push(email)

		await identityManagementService.create(email)
		const challengeToken = await identityManagementService.issueAuthChallenge(email, expirationInMinutes)

		// Verify challenge was set by fetching user attributes
		const getUserCommand = new AdminGetUserCommand({
			UserPoolId: userPoolId,
			Username: email,
		})
		const user = await cognitoClient.send(getUserCommand)

		expect(user).toBeDefined()
		const authChallengeAttribute = user.UserAttributes?.find((attr) => attr.Name === "custom:authChallenge")
		expect(authChallengeAttribute).toBeDefined()
		expect(authChallengeAttribute?.Value).toBe(challengeToken)
		expect(challengeToken).toBeTruthy()
	})

	it("should update auth challenge when issuing it multiple times", async () => {
		const email = `test-update-token-${Date.now()}@example.com`
		const expirationInMinutes = 15
		testEmails.push(email)

		await identityManagementService.create(email)
		const firstToken = await identityManagementService.issueAuthChallenge(email, expirationInMinutes)

		// Verify first challenge
		let getUserCommand = new AdminGetUserCommand({
			UserPoolId: userPoolId,
			Username: email,
		})
		let user = await cognitoClient.send(getUserCommand)
		let authChallengeAttribute = user.UserAttributes?.find((attr) => attr.Name === "custom:authChallenge")
		expect(authChallengeAttribute?.Value).toBe(firstToken)

		// Update challenge
		const secondToken = await identityManagementService.issueAuthChallenge(email, expirationInMinutes)

		// Verify second challenge
		getUserCommand = new AdminGetUserCommand({
			UserPoolId: userPoolId,
			Username: email,
		})
		user = await cognitoClient.send(getUserCommand)
		authChallengeAttribute = user.UserAttributes?.find((attr) => attr.Name === "custom:authChallenge")
		expect(authChallengeAttribute?.Value).toBe(secondToken)
		expect(secondToken).not.toBe(firstToken)
	})

	it("should handle multiple users correctly", async () => {
		const email1 = `test-multi-1-${Date.now()}@example.com`
		const email2 = `test-multi-2-${Date.now()}@example.com`
		testEmails.push(email1, email2)

		await identityManagementService.create(email1)
		await identityManagementService.create(email2)

		const found1 = await identityManagementService.exists(email1)
		const found2 = await identityManagementService.exists(email2)

		expect(found1).toBe(true)
		expect(found2).toBe(true)
	})

	it("should throw an error when creating a user that already exists", async () => {
		const email = `test-duplicate-${Date.now()}@example.com`
		testEmails.push(email)

		await identityManagementService.create(email)

		// Attempt to create the same user again
		await expect(identityManagementService.create(email)).rejects.toThrow()
	})

	it("should throw an error when issuing auth challenge for non-existent user", async () => {
		const nonExistentEmail = `test-nonexistent-challenge-${Date.now()}@example.com`
		const expirationInMinutes = 15

		await expect(
			identityManagementService.issueAuthChallenge(nonExistentEmail, expirationInMinutes),
		).rejects.toThrow()
	})

	it("should throw an error when user pool ID is invalid", async () => {
		const invalidIdentityManagementService = new CognitoIdentityManagementService(
			"invalid-pool-id",
			userPoolClientId,
		)
		const email = `test-invalid-${Date.now()}@example.com`

		await expect(invalidIdentityManagementService.create(email)).rejects.toThrow()
	})

	it("should return Account with correct email after rehydration", async () => {
		const email = `test-rehydrate-${Date.now()}@example.com`
		testEmails.push(email)

		await identityManagementService.create(email)
		const found = await identityManagementService.exists(email)

		expect(found).not.toBeNull()
		expect(found).toBe(true)
	})

	it("should handle findByEmail error for non-UserNotFoundException", async () => {
		// Create a repository with invalid pool ID to trigger an error
		const invalidIdentityManagementService = new CognitoIdentityManagementService(
			"invalid-pool-id",
			userPoolClientId,
		)
		const email = `test-error-${Date.now()}@example.com`

		await expect(invalidIdentityManagementService.exists(email)).rejects.toThrow("Error getting user from Cognito")
	})

	it("should create user with SUPPRESS message action", async () => {
		const email = `test-suppress-${Date.now()}@example.com`
		testEmails.push(email)

		await identityManagementService.create(email)

		// Verify user was created (if message action wasn't SUPPRESS, Cognito would send welcome email)
		const getUserCommand = new AdminGetUserCommand({
			UserPoolId: userPoolId,
			Username: email,
		})
		const user = await cognitoClient.send(getUserCommand)

		expect(user).toBeDefined()
		// When email is used as username attribute, the email is in UserAttributes, not Username
		const emailAttribute = user.UserAttributes?.find((attr) => attr.Name === "email")
		expect(emailAttribute?.Value).toBe(email)
		// User should be in FORCE_CHANGE_PASSWORD status when created with SUPPRESS
		expect(user.UserStatus).toBe("FORCE_CHANGE_PASSWORD")
	})

	it("should verify auth challenge and return AuthSession", async () => {
		const email = `test-verify-challenge-${Date.now()}@example.com`
		const expirationInMinutes = 15
		testEmails.push(email)

		await identityManagementService.create(email)
		const challengeToken = await identityManagementService.issueAuthChallenge(email, expirationInMinutes)

		// Verify the challenge - this requires Cognito triggers to be configured
		const authSession = await identityManagementService.verifyAuthChallenge(email, challengeToken)

		expect(authSession).toBeDefined()
		expect(authSession).toBeInstanceOf(AuthSession)
		const accessToken = authSession.getAccessToken()
		expect(accessToken).toBeDefined()
		expect(typeof accessToken).toBe("string")
		expect(accessToken.length).toBeGreaterThan(0)
		const user = authSession.getUser()
		expect(user).toBeDefined()
		expect(user.getEmail()).toBe(email)
	}, 8_000)

	it("should throw an error when verifying auth challenge for non-existent user", async () => {
		const nonExistentEmail = `test-nonexistent-verify-${Date.now()}@example.com`
		const challenge = "test-challenge-token"

		await expect(identityManagementService.verifyAuthChallenge(nonExistentEmail, challenge)).rejects.toThrow()
	})

	it("should throw an error when verifying with invalid challenge token", async () => {
		const email = `test-invalid-challenge-${Date.now()}@example.com`
		const invalidChallenge = "invalid-challenge-token"
		testEmails.push(email)

		await identityManagementService.create(email)
		await identityManagementService.issueAuthChallenge(email, 15)

		// Attempt to verify with wrong challenge token
		await expect(identityManagementService.verifyAuthChallenge(email, invalidChallenge)).rejects.toThrow()
	})
})
