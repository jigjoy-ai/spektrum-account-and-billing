export class CurrentUser {
	private constructor(
        private readonly userId: string,
		private readonly userEmail: string,
	) {}

	getUserId(): string {
		return this.userId
	}

	getUserEmail(): string {
		return this.userEmail
	}

	static rehydrate(userId: string, userEmail: string): CurrentUser {
		return new CurrentUser(userId, userEmail)
	}
}

