import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import {
	AdminCreateUserCommand,
	AdminGetUserCommand,
	AdminUpdateUserAttributesCommand,
	CognitoIdentityProviderClient,
	InitiateAuthCommand,
	InitiateAuthCommandOutput,
	RespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import { AWSKeyManagementService } from "@infra/services/cognito-identity-management/util/aws-key-management-service"
import { ValidationError } from "@jigjoy-ai/serverless-core"
import { User } from "@domain/user"

export class CognitoIdentityManagementService implements IdentityManagementService {
	private readonly cognito: CognitoIdentityProviderClient
	private readonly ONE_MINUTE_IN_MS: number = 60 * 1000

	constructor(
		private readonly userPoolId: string,
		private readonly userPoolClientId: string,
		cognitoClient?: CognitoIdentityProviderClient,
	) {
		this.cognito =
			cognitoClient ||
			new CognitoIdentityProviderClient({ region: process.env.AWS_REGION, profile: process.env.AWS_PROFILE })
	}

	async exists(email: string): Promise<boolean> {
		try {
			const getUserCommand = new AdminGetUserCommand({
				Username: email,
				UserPoolId: this.userPoolId,
			})
			await this.cognito.send(getUserCommand)
			return true
		} catch (error: any) {
			switch (error.name) {
				case "UserNotFoundException":
					return false
				default:
					throw new Error(`Error getting user from Cognito: ${error}`)
			}
		}
	}

	async get(email: string): Promise<User | null> {
		const getUserCommand = new AdminGetUserCommand({
			Username: email,
			UserPoolId: this.userPoolId,
		})
		const user = await this.cognito.send(getUserCommand)

		if (!user) {
			return null
		}
		const userEmail = (user.UserAttributes?.find((attr) => attr.Name === "email")?.Value as string) ?? ""
		return User.rehydrate(user.Username as string, userEmail)
	}

	async create(email: string): Promise<User> {
		const createUserCommand = new AdminCreateUserCommand({
			Username: email,
			UserPoolId: this.userPoolId,
			MessageAction: "SUPPRESS",
		})
		const response = await this.cognito.send(createUserCommand)
		return User.rehydrate(response.User?.Username as string, email)
	}

	async issueAuthChallenge(email: string, expirationInMinutes: number): Promise<string> {
		if (!process.env.KMS_KEY_ID) {
			throw new Error("KMS_KEY_ID environment variable is required")
		}

		const awsKeyManagementService = new AWSKeyManagementService(process.env.KMS_KEY_ID)

		const now = new Date()
		const EXPIRATION_IN_MS = expirationInMinutes * this.ONE_MINUTE_IN_MS
		const expiresAt = new Date(now.getTime() + EXPIRATION_IN_MS)

		const payload = {
			email: email,
			expiration: expiresAt.toJSON(),
		}

		const rawChallengeToken = await awsKeyManagementService.encrypt(JSON.stringify(payload))
		const challengeTokenB64 = Buffer.from(rawChallengeToken).toString("base64")

		await this.cognito.send(
			new AdminUpdateUserAttributesCommand({
				UserPoolId: this.userPoolId,
				Username: email,
				UserAttributes: [{ Name: "custom:authChallenge", Value: challengeTokenB64 }],
			}),
		)

		return challengeTokenB64
	}

	extractAccessToken(challengeResponse: InitiateAuthCommandOutput): string {
		if (!challengeResponse.AuthenticationResult?.AccessToken) {
			console.error("verifyAuthChallenge - No access token in response")
			throw new Error("Failed to verify challenge")
		}
		return challengeResponse.AuthenticationResult.AccessToken as string
	}

	async verifyAuthChallenge(email: string, challenge: string): Promise<string> {
		let challengeResponse: InitiateAuthCommandOutput
		try {
			// This will trigger DefineAuthChallenge
			// DefineAuthChallenge will trigger createAuthChallenge if Custom Challenge is required
			const authResponse = await this.cognito.send(
				new InitiateAuthCommand({
					AuthFlow: "CUSTOM_AUTH",
					ClientId: this.userPoolClientId,
					AuthParameters: { USERNAME: email },
				}),
			)

			if (authResponse.ChallengeName !== "CUSTOM_CHALLENGE" || !authResponse.Session) {
				throw new Error("Challenge not found")
			}

			// This will trigger verifyAuthChallengeResponseHandler
			challengeResponse = await this.cognito.send(
				new RespondToAuthChallengeCommand({
					ClientId: this.userPoolClientId,
					ChallengeName: "CUSTOM_CHALLENGE",
					Session: authResponse.Session,
					ChallengeResponses: {
						USERNAME: email,
						ANSWER: challenge,
					},
				}),
			)
			const accessToken = this.extractAccessToken(challengeResponse)

			console.log("verifyAuthChallenge - Verification successful")

			return accessToken
		} catch (error: any) {
			console.error("verifyAuthChallenge - Error verifying challenge:", error)
			// Preserve "Challenge not found" error message
			if (error.message === "Challenge not found") {
				throw error
			}
			throw new ValidationError("Failed to verify challenge")
		}
	}
}
