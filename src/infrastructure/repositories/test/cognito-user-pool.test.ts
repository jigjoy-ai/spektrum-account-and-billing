import { describe, it, expect, beforeEach, afterEach } from "@rstest/core"
import {
	CognitoIdentityProviderClient,
	AdminDeleteUserCommand,
	AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import { CognitoUserPool } from "@infra/repositories/cognito-identity-management"
import { Account } from "@domain/account"

describe("Cognito User Pool Repository", () => {
	let repository: CognitoUserPool
	let cognitoClient: CognitoIdentityProviderClient
	const testEmails: string[] = []

	const userPoolId = process.env.USER_POOL_ID as string

	beforeEach(() => {
		cognitoClient = new CognitoIdentityProviderClient({
			region: process.env.AWS_REGION,
			profile: process.env.AWS_PROFILE,
		})
		repository = new CognitoUserPool(userPoolId)
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

	it("should return null when finding a non-existent user", async () => {
		const nonExistentEmail = `test-nonexistent-${Date.now()}@example.com`

		const result = await repository.findByEmail(nonExistentEmail)

		expect(result).toBeNull()
	})

	it("should create a user in Cognito", async () => {
		const email = `test-create-${Date.now()}@example.com`
		const account = Account.create(email)
		testEmails.push(email)

		await repository.create(account)

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
		const account = Account.create(email)
		testEmails.push(email)

		await repository.create(account)
		const found = await repository.findByEmail(email)

		expect(found).not.toBeNull()
		expect(found?.getEmail()).toBe(email)
	})

	it("should set auth challenge for a user", async () => {
		const email = `test-challenge-${Date.now()}@example.com`
		const account = Account.create(email)
		const challenge = "test-auth-challenge-123"
		testEmails.push(email)

		await repository.create(account)
		await repository.setAuthChallenge(email, challenge)

		// Verify challenge was set by fetching user attributes
		const getUserCommand = new AdminGetUserCommand({
			UserPoolId: userPoolId,
			Username: email,
		})
		const user = await cognitoClient.send(getUserCommand)

		expect(user).toBeDefined()
		const authChallengeAttribute = user.UserAttributes?.find(
			(attr) => attr.Name === "custom:authChallenge",
		)
		expect(authChallengeAttribute).toBeDefined()
		expect(authChallengeAttribute?.Value).toBe(challenge)
	})

	it("should update auth challenge when setting it multiple times", async () => {
		const email = `test-update-challenge-${Date.now()}@example.com`
		const account = Account.create(email)
		const firstChallenge = "first-challenge-123"
		const secondChallenge = "second-challenge-456"
		testEmails.push(email)

		await repository.create(account)
		await repository.setAuthChallenge(email, firstChallenge)

		// Verify first challenge
		let getUserCommand = new AdminGetUserCommand({
			UserPoolId: userPoolId,
			Username: email,
		})
		let user = await cognitoClient.send(getUserCommand)
		let authChallengeAttribute = user.UserAttributes?.find(
			(attr) => attr.Name === "custom:authChallenge",
		)
		expect(authChallengeAttribute?.Value).toBe(firstChallenge)

		// Update challenge
		await repository.setAuthChallenge(email, secondChallenge)

		// Verify second challenge
		getUserCommand = new AdminGetUserCommand({
			UserPoolId: userPoolId,
			Username: email,
		})
		user = await cognitoClient.send(getUserCommand)
		authChallengeAttribute = user.UserAttributes?.find(
			(attr) => attr.Name === "custom:authChallenge",
		)
		expect(authChallengeAttribute?.Value).toBe(secondChallenge)
	})

	it("should handle multiple users correctly", async () => {
		const email1 = `test-multi-1-${Date.now()}@example.com`
		const email2 = `test-multi-2-${Date.now()}@example.com`
		const account1 = Account.create(email1)
		const account2 = Account.create(email2)
		testEmails.push(email1, email2)

		await repository.create(account1)
		await repository.create(account2)

		const found1 = await repository.findByEmail(email1)
		const found2 = await repository.findByEmail(email2)

		expect(found1).not.toBeNull()
		expect(found1?.getEmail()).toBe(email1)
		expect(found2).not.toBeNull()
		expect(found2?.getEmail()).toBe(email2)
		expect(found1?.getEmail()).not.toBe(found2?.getEmail())
	})

	it("should throw an error when creating a user that already exists", async () => {
		const email = `test-duplicate-${Date.now()}@example.com`
		const account = Account.create(email)
		testEmails.push(email)

		await repository.create(account)

		// Attempt to create the same user again
		await expect(repository.create(account)).rejects.toThrow()
	})

	it("should throw an error when setting auth challenge for non-existent user", async () => {
		const nonExistentEmail = `test-nonexistent-challenge-${Date.now()}@example.com`
		const challenge = "test-challenge"

		await expect(repository.setAuthChallenge(nonExistentEmail, challenge)).rejects.toThrow()
	})

	it("should throw an error when user pool ID is invalid", async () => {
		const invalidRepository = new CognitoUserPool("invalid-pool-id")
		const email = `test-invalid-${Date.now()}@example.com`
		const account = Account.create(email)

		await expect(invalidRepository.create(account)).rejects.toThrow()
	})

	it("should return Account with correct email after rehydration", async () => {
		const email = `test-rehydrate-${Date.now()}@example.com`
		const account = Account.create(email)
		testEmails.push(email)

		await repository.create(account)
		const found = await repository.findByEmail(email)

		expect(found).not.toBeNull()
		expect(found?.getEmail()).toBe(email)
		expect(found).toBeInstanceOf(Account)
	})

	it("should handle findByEmail error for non-UserNotFoundException", async () => {
		// Create a repository with invalid pool ID to trigger an error
		const invalidRepository = new CognitoUserPool("invalid-pool-id")
		const email = `test-error-${Date.now()}@example.com`

		await expect(invalidRepository.findByEmail(email)).rejects.toThrow(
			"Error getting user from Cognito",
		)
	})

	it("should create user with SUPPRESS message action", async () => {
		const email = `test-suppress-${Date.now()}@example.com`
		const account = Account.create(email)
		testEmails.push(email)

		await repository.create(account)

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
})
