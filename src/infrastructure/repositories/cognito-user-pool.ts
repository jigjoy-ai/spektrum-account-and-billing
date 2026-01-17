import { AccountStore } from "@app/ports/repositories/account-store"
import {
	AdminCreateUserCommand,
	AdminGetUserCommand,
	AdminUpdateUserAttributesCommand,
	CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider"
import { Account } from "@domain/account"

export class CognitoUserPool implements AccountStore {
	private readonly cognito = new CognitoIdentityProviderClient()

	constructor(private readonly userPoolId: string) {}

	async findByEmail(email: string): Promise<Account | null> {
		try {
			const getUserCommand = new AdminGetUserCommand({
				Username: email,
				UserPoolId: this.userPoolId,
			})
			await this.cognito.send(getUserCommand)
			return Account.rehydrate(email)
		} catch (error: any) {
			switch (error.name) {
				case "UserNotFoundException":
					return null
				default:
					throw new Error(`Error getting user from Cognito: ${error}`)
			}
		}
	}
	async create(account: Account): Promise<void> {
		const createUserCommand = new AdminCreateUserCommand({
			Username: account.getEmail(),
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
}
