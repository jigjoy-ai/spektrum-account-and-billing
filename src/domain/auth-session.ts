import { Account } from "./account"

export class AuthSession {
	private constructor(
		private readonly accessToken: string,
		private readonly account: Account,
	) {}

	static create(accessToken: string, account: Account): AuthSession {
		return new AuthSession(accessToken, account)
	}

	getAccessToken(): string {
		return this.accessToken
	}

	getAccount(): Account {
		return this.account
	}
}
