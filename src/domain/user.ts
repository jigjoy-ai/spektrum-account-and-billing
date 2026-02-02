export class User {
	private constructor(
		private readonly id: string,
		private readonly email: string,
	) {}

	getId(): string {
		return this.id
	}

	getEmail(): string {
		return this.email
	}

	static rehydrate(id: string, email: string): User {
		return new User(id, email)
	}
}
