import { User } from "./user"

export class AuthSession {
	private constructor(
		private readonly accessToken: string,
		private readonly user: User,
	) {}

	static create(accessToken: string, user: User): AuthSession {
		return new AuthSession(accessToken, user)
	}

	getAccessToken(): string {
		return this.accessToken
	}

	getUser(): User {
		return this.user
	}
}
