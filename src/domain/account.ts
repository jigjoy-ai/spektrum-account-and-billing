import { v4 as uuidv4 } from "uuid"
import { User } from "./user"

export class Account {
	private constructor(
		private readonly id: string,
		private readonly rootEmail: string,
		private creditsUsd: number,
		private users: User[],
	) {}

	getId(): string {
		return this.id
	}

	getRootEmail(): string {
		return this.rootEmail
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
		if (amount < 0) {
			throw new Error("Amount must be greater than 0")
		}

		this.creditsUsd -= amount
	}

	addUser(user: User): void {
		this.users.push(user)
	}

	removeUser(user: User): void {
		if (!this.users.includes(user)) {
			throw new Error("User not found")
		}

		if (this.users.length === 1) {
			throw new Error("Cannot remove last user")
		}

		this.users = this.users.filter((u) => u.getId() !== user.getId())
	}

	getUsers(): User[] {
		return [...this.users]
	}

	static rehydrate(id: string, email: string, credits: number, users: User[]): Account {
		return new Account(id, email, credits, users)
	}

	static create(rootEmail: string, freeCreditsUsd: number): Account {
		const id = uuidv4()

		if (freeCreditsUsd < 0) {
			throw new Error("Free credits must be greater than or equal to 0")
		}

		if (freeCreditsUsd > 5) {
			throw new Error("Free credits must be less than or equal to $5")
		}

		return new Account(id, rootEmail, freeCreditsUsd, [])
	}
}
