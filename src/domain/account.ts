import { v4 as uuidv4 } from "uuid"
import { UserIdentity } from "./user-identity"

export class Account {
	private constructor(
		private readonly id: string,
		private readonly email: string,
		private creditsUsd: number,
		private users: UserIdentity[],
		private apiKeys: string[],
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

	addUser(user: UserIdentity): void {
		this.users.push(user)
	}

	removeUser(user: UserIdentity): void {
		if (!this.users.includes(user)) {
			throw new Error("User not found")
		}

		if (this.users.length === 1) {
			throw new Error("Cannot remove last user")
		}

		this.users = this.users.filter((u) => u.getId() !== user.getId())
	}

	generateApiKey(): string {
		const apiKey = uuidv4()
		this.apiKeys.push(apiKey)
		return apiKey
	}

	revokeApiKey(apiKeyIndex: number): void {
		if (apiKeyIndex < 0 || apiKeyIndex >= this.apiKeys.length) {
			throw new Error("API key index out of bounds")
		}
		this.apiKeys.splice(apiKeyIndex, 1)
	}

	hasApiKey(apiKey: string): boolean {
		return this.apiKeys.includes(apiKey)
	}

	getApiKeys(): string[] {
		const apiKeys = this.apiKeys.map((key) => {
			return key.substring(0, 8) + "xxxxxx" + key.substring(key.length - 8)
		})
		return apiKeys
	}

	static rehydrate(id: string, email: string, credits: number, users: UserIdentity[], apiKeys: string[]): Account {
		return new Account(id, email, credits, users, apiKeys)
	}

	static create(email: string, user: UserIdentity, creditsUsd: number): Account {
		const id = uuidv4()
		return new Account(id, email, creditsUsd, [user], [])
	}
}
