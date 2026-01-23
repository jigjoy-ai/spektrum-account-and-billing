import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import {
	AdminCreateUserCommand,
	AdminGetUserCommand,
	AdminUpdateUserAttributesCommand,
	CognitoIdentityProviderClient,
	InitiateAuthCommand,
	RespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider"

export class CognitoIdentityManagementService implements IdentityManagementService {
	private readonly cognito = new CognitoIdentityProviderClient()

	constructor(private readonly userPoolId: string, private readonly userPoolClientId: string) {}

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

	async setAuthChallenge(email: string, challenge: string): Promise<void> {

		await this.cognito.send(
			new AdminUpdateUserAttributesCommand({
				UserPoolId: this.userPoolId,
				Username: email,
				UserAttributes: [{ Name: "custom:authChallenge", Value: challenge }],
			}),
		)
		  

	}

	async verifyAuthChallenge(email: string, challenge: string): Promise<void> {

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
		await this.cognito.send(
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
	}
}
