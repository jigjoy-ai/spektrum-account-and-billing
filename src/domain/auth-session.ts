import { UserIdentity } from "./user-identity"

export class AuthSession {
	private constructor(
		private readonly accessToken: string,
		private readonly userIdentity: UserIdentity,
	) {}

	static create(accessToken: string, userIdentity: UserIdentity): AuthSession {
		return new AuthSession(accessToken, userIdentity)
	}

	getAccessToken(): string {
		return this.accessToken
	}

	getUserIdentity(): UserIdentity {
		return this.userIdentity
	}
}
