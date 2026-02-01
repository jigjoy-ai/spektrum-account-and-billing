export class Account {
	private constructor(
		private readonly id: string,
		private readonly email: string,
		private creditsUsd: number,
	) {}

	getId(): string {
		return this.id
	}

	getEmail(): string {
		return this.email
	}

	getRemainingCredits(): number {
		return Number(this.creditsUsd.toFixed(2))
	}

	addCredits(amount: number): void {
		if (amount < 5) {
			throw new Error("Amount must be greater than $5")
		}
		if (amount > 5000) {
			throw new Error("Amount must be less than $5000")
		}
		this.creditsUsd += amount
	}

	deductCredits(amount: number): void {
		if (this.creditsUsd <= 0) {
			throw new Error("No remaining credits")
		}
		this.creditsUsd -= amount
	}

	static rehydrate(id: string, email: string, credits: number): Account {
		return new Account(id, email, credits)
	}

	static create(id: string, email: string): Account {
		const creditsUsd = 5.0
		return new Account(id, email, creditsUsd)
	}
}
