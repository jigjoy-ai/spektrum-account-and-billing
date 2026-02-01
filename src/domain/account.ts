export class Account {
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

	static rehydrate(id: string, email: string): Account {
		return new Account(id, email)
	}
}
