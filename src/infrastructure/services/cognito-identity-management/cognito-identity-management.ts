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
import { AWSKeyManagementService } from "./util/aws-key-management-service"
import { CognitoJwtVerifier } from "aws-jwt-verify"
import { AuthSession } from "@domain/auth-session"
import { ValidationError } from "@jigjoy-io/serverless-core"
import { UserIdentity } from "@domain/user-identity"

export class CognitoIdentityManagementService implements IdentityManagementService {
	private readonly cognito: CognitoIdentityProviderClient
	private readonly ONE_MINUTE_IN_MS: number = 60 * 1000
	private readonly awsKeyManagementService: AWSKeyManagementService

	constructor(
		private readonly userPoolId: string,
		private readonly userPoolClientId: string,
		cognitoClient?: CognitoIdentityProviderClient,
	) {
		if (!process.env.KMS_KEY_ID) {
			throw new Error("KMS_KEY_ID environment variable is required")
		}

		this.awsKeyManagementService = new AWSKeyManagementService(process.env.KMS_KEY_ID)
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

	async get(email: string): Promise<UserIdentity | null> {
		const getUserCommand = new AdminGetUserCommand({
			Username: email,
			UserPoolId: this.userPoolId,
		})
		const user = await this.cognito.send(getUserCommand)

		if (!user) {
			return null
		}
		const userEmail = (user.UserAttributes?.find((attr) => attr.Name === "email")?.Value as string) ?? ""
		return UserIdentity.rehydrate(user.Username as string, userEmail)
	}

	async create(email: string): Promise<UserIdentity> {
		const createUserCommand = new AdminCreateUserCommand({
			Username: email,
			UserPoolId: this.userPoolId,
			MessageAction: "SUPPRESS",
		})
		const response = await this.cognito.send(createUserCommand)
		return UserIdentity.rehydrate(response.User?.Username as string, email)
	}

	async issueAuthChallenge(email: string, expirationInMinutes: number): Promise<string> {
		const now = new Date()
		const EXPIRATION_IN_MS = expirationInMinutes * this.ONE_MINUTE_IN_MS
		const expiresAt = new Date(now.getTime() + EXPIRATION_IN_MS)

		const payload = {
			email: email,
			expiration: expiresAt.toJSON(),
		}

		const rawChallengeToken = await this.awsKeyManagementService.encrypt(JSON.stringify(payload))
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

	async isAuthorized(authToken: string): Promise<boolean> {
		const verifier = await CognitoJwtVerifier.create({
			userPoolId: this.userPoolId,
			tokenUse: "access",
			clientId: this.userPoolClientId,
		})

		try {
			await verifier.verify(authToken)
			return true
		} catch (error: any) {
			console.error("isAuthorized - Error verifying token:", error)
			return false
		}
	}

	async extractUserIdentity(challengeResponse: InitiateAuthCommandOutput): Promise<UserIdentity> {
		if (!challengeResponse.AuthenticationResult?.IdToken) {
			console.error("verifyAuthChallenge - No id token in response")
			throw new Error("Failed to verify challenge")
		}
		const verifier = await CognitoJwtVerifier.create({
			userPoolId: this.userPoolId,
			tokenUse: "id",
			clientId: this.userPoolClientId,
		})

		const payload = await verifier.verify(challengeResponse.AuthenticationResult.IdToken as string)
		return UserIdentity.rehydrate(payload.sub, payload.email as string)
	}

	extractAccessToken(challengeResponse: InitiateAuthCommandOutput): string {
		if (!challengeResponse.AuthenticationResult?.AccessToken) {
			console.error("verifyAuthChallenge - No access token in response")
			throw new Error("Failed to verify challenge")
		}
		return challengeResponse.AuthenticationResult.AccessToken as string
	}

	async verifyAuthChallenge(email: string, challenge: string): Promise<AuthSession> {
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

			const userIdentity = await this.extractUserIdentity(challengeResponse)
			const accessToken = this.extractAccessToken(challengeResponse)

			console.log("verifyAuthChallenge - Verification successful")

			return AuthSession.create(accessToken, userIdentity)
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
