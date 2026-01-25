import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import {
	AdminCreateUserCommand,
	AdminGetUserCommand,
	AdminUpdateUserAttributesCommand,
	CognitoIdentityProviderClient,
	InitiateAuthCommand,
	RespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import { AWSKeyManagementService } from "./util/aws-key-management-service"
import { CurrentUser } from "@domain/current-user"
import { CognitoJwtVerifier } from "aws-jwt-verify"


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
		this.cognito = cognitoClient || new CognitoIdentityProviderClient()
	}

	async getCurrentUserFromAccessToken(accessToken: string): Promise<CurrentUser> {

		console.log("userPoolId", this.userPoolId)
		console.log("userPoolClientId", this.userPoolClientId)
		const verifier = await CognitoJwtVerifier.create({
			userPoolId: this.userPoolId,
			tokenUse: "access",
			clientId: this.userPoolClientId,
		})

		const payload = await verifier.verify(accessToken)
		return CurrentUser.rehydrate(payload.sub, payload.email as string)
	}

	async hasUser(email: string): Promise<boolean> {
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

	async createUser(email: string): Promise<void> {
		const createUserCommand = new AdminCreateUserCommand({
			Username: email,
			UserPoolId: this.userPoolId,
			MessageAction: "SUPPRESS",
		})
		await this.cognito.send(createUserCommand)
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

	async verifyAuthChallenge(email: string, challenge: string): Promise<string> {

		// This will trigger DefineAuthChallenge 
		// DefineAuthChallenge will trigger createAuthChallenge if Custom Challenge is required
		const authResponse = await this.cognito.send(
			new InitiateAuthCommand({
				AuthFlow: "CUSTOM_AUTH",
				ClientId: this.userPoolClientId,
				AuthParameters: { USERNAME: email },
			})
		)

		if (authResponse.ChallengeName !== "CUSTOM_CHALLENGE" || !authResponse.Session) {
			// Keep it generic
			throw new Error("Challenge not found")
		}

		// This will trigger verifyAuthChallengeResponseHandler
		const challengeResponse = await this.cognito.send(
			new RespondToAuthChallengeCommand({
				ClientId: this.userPoolClientId,
				ChallengeName: "CUSTOM_CHALLENGE",
				Session: authResponse.Session,
				ChallengeResponses: {
					USERNAME: email,
					ANSWER: challenge,
				},
			})
		)

		if (!challengeResponse.AuthenticationResult?.AccessToken) {
			throw new Error("Failed to verify challenge")
		}

		return challengeResponse.AuthenticationResult.AccessToken
	}
}
