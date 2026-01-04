export class Account {
	private readonly email: string

	private constructor(email: string) {
		this.email = email
	}

	getEmail(): string {
		return this.email
	}

	static create(email: string): Account {
		return new Account(email)
	}

	static rehydrate(email: string): Account {
		return new Account(email)
	}
}
