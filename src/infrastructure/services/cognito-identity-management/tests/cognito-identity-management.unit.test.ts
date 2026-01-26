import { describe, it, expect } from "@rstest/core"
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider"
import { CognitoIdentityManagementService } from "@infra/services/cognito-identity-management/cognito-identity-management"

describe("Cognito Identity Management Service Unit", () => {
	const userPoolId = "test-pool-id"
	const userPoolClientId = "test-client-id"

	it("should throw an error when KMS_KEY_ID is missing", () => {
		// Save the original value
		const originalKmsKeyId = process.env.KMS_KEY_ID

		// Temporarily unset KMS_KEY_ID
		delete process.env.KMS_KEY_ID

		// Attempt to create service without KMS_KEY_ID
		expect(() => {
			new CognitoIdentityManagementService(userPoolId, userPoolClientId)
		}).toThrow("KMS_KEY_ID environment variable is required")

		// Restore the original value
		if (originalKmsKeyId) {
			process.env.KMS_KEY_ID = originalKmsKeyId
		}
	})

	it("should throw 'Challenge not found' when Cognito InitiateAuth returns unexpected challenge name", async () => {
		// Setup mock Cognito client
		let callCount = 0
		const responses: any[] = [
			{
				ChallengeName: "NEW_PASSWORD_REQUIRED",
				Session: "some-session",
			},
		]
		const mockCognitoClient = {
			send: ((command: any) => {
				const response = responses[callCount]
				callCount++
				return Promise.resolve(response)
			}) as any,
		}

		const service = new CognitoIdentityManagementService(
			userPoolId,
			userPoolClientId,
			mockCognitoClient as CognitoIdentityProviderClient,
		)

		await expect(service.verifyAuthChallenge("test@example.com", "challenge-token")).rejects.toThrow(
			"Challenge not found",
		)
	})

	it("should throw 'Challenge not found' when Cognito InitiateAuth returns CUSTOM_CHALLENGE without Session", async () => {
		// Setup mock Cognito client
		let callCount = 0
		const responses: any[] = [
			{
				ChallengeName: "CUSTOM_CHALLENGE",
				Session: undefined,
			},
		]
		const mockCognitoClient = {
			send: ((command: any) => {
				const response = responses[callCount]
				callCount++
				return Promise.resolve(response)
			}) as any,
		}

		const service = new CognitoIdentityManagementService(
			userPoolId,
			userPoolClientId,
			mockCognitoClient as CognitoIdentityProviderClient,
		)

		await expect(service.verifyAuthChallenge("test@example.com", "challenge-token")).rejects.toThrow(
			"Challenge not found",
		)
	})

	it("should throw 'Challenge not found' when Cognito InitiateAuth returns null Session", async () => {
		// Setup mock Cognito client
		let callCount = 0
		const responses: any[] = [
			{
				ChallengeName: "CUSTOM_CHALLENGE",
				Session: null,
			},
		]
		const mockCognitoClient = {
			send: ((command: any) => {
				const response = responses[callCount]
				callCount++
				return Promise.resolve(response)
			}) as any,
		}

		const service = new CognitoIdentityManagementService(
			userPoolId,
			userPoolClientId,
			mockCognitoClient as CognitoIdentityProviderClient,
		)

		await expect(service.verifyAuthChallenge("test@example.com", "challenge-token")).rejects.toThrow(
			"Challenge not found",
		)
	})

	it("should throw 'Failed to verify challenge' when Cognito RespondToAuthChallenge returns no AccessToken", async () => {
		// Setup mock Cognito client
		let callCount = 0
		const responses: any[] = [
			{
				ChallengeName: "CUSTOM_CHALLENGE",
				Session: "valid-session",
			},
			{
				AuthenticationResult: undefined,
			},
		]
		const mockCognitoClient = {
			send: ((command: any) => {
				const response = responses[callCount]
				callCount++
				return Promise.resolve(response)
			}) as any,
		}

		const service = new CognitoIdentityManagementService(
			userPoolId,
			userPoolClientId,
			mockCognitoClient as CognitoIdentityProviderClient,
		)

		await expect(service.verifyAuthChallenge("test@example.com", "challenge-token")).rejects.toThrow(
			"Failed to verify challenge",
		)
	})

	it("should throw 'Failed to verify challenge' when Cognito RespondToAuthChallenge returns null AccessToken", async () => {
		// Setup mock Cognito client
		let callCount = 0
		const responses: any[] = [
			{
				ChallengeName: "CUSTOM_CHALLENGE",
				Session: "valid-session",
			},
			{
				AuthenticationResult: {
					AccessToken: null,
				},
			},
		]
		const mockCognitoClient = {
			send: ((command: any) => {
				const response = responses[callCount]
				callCount++
				return Promise.resolve(response)
			}) as any,
		}

		const service = new CognitoIdentityManagementService(
			userPoolId,
			userPoolClientId,
			mockCognitoClient as CognitoIdentityProviderClient,
		)

		await expect(service.verifyAuthChallenge("test@example.com", "challenge-token")).rejects.toThrow(
			"Failed to verify challenge",
		)
	})

	it("should throw 'Failed to verify challenge' when Cognito RespondToAuthChallenge returns undefined AccessToken", async () => {
		// Setup mock Cognito client
		let callCount = 0
		const responses: any[] = [
			{
				ChallengeName: "CUSTOM_CHALLENGE",
				Session: "valid-session",
			},
			{
				AuthenticationResult: {
					AccessToken: undefined,
				},
			},
		]
		const mockCognitoClient = {
			send: ((command: any) => {
				const response = responses[callCount]
				callCount++
				return Promise.resolve(response)
			}) as any,
		}

		const service = new CognitoIdentityManagementService(
			userPoolId,
			userPoolClientId,
			mockCognitoClient as CognitoIdentityProviderClient,
		)

		await expect(service.verifyAuthChallenge("test@example.com", "challenge-token")).rejects.toThrow(
			"Failed to verify challenge",
		)
	})
})
