import { UserData } from "./user-data"

export class AuthSession {
	private constructor(
		private readonly accessToken: string,
		private readonly userData: UserData,
	) {}

	static create(accessToken: string, userData: UserData): AuthSession {
		return new AuthSession(accessToken, userData)
	}

	getAccessToken(): string {
		return this.accessToken
	}

	getUserData(): UserData {
		return this.userData
	}
}