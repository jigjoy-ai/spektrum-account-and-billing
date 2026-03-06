import { Organization } from "./organization"
import { ApiKey } from "./api-key"

export class AuthSession {
	private constructor(
		private readonly accessToken: string,
		private readonly userEmail: string,
		private readonly userId: string,
		private readonly organization: Organization,
		private readonly apiKeys: ApiKey[],
	) {}

	static create(accessToken: string, userEmail: string, userId: string, organization: Organization, apiKeys: ApiKey[]): AuthSession {
		return new AuthSession(accessToken, userEmail, userId, organization, apiKeys)
	}

	getAccessToken(): string {
		return this.accessToken
	}

	getApiKeys(): ApiKey[] {
		return this.apiKeys
	}

	getOrganization(): Organization {
		return this.organization
	}

	getUserEmail(): string {
		return this.userEmail
	}

	getUserId(): string {
		return this.userId
	}
}
