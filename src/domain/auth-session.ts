import { Account } from "./account"
import { ApiKey } from "./api-key"

export class AuthSession {
	private constructor(
		private readonly accessToken: string,
		private readonly account: Account,
		private readonly apiKeys: ApiKey[],
	) {}

	static create(accessToken: string, account: Account, apiKeys: ApiKey[]): AuthSession {
		return new AuthSession(accessToken, account, apiKeys)
	}

	getAccessToken(): string {
		return this.accessToken
	}

	getAccount(): Account {
		return this.account
	}

	getApiKeys(): ApiKey[] {
		return this.apiKeys
	}
}
