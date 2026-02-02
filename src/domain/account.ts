import { v4 as uuidv4 } from "uuid"
import crypto from "crypto"
import { User } from "./user"

export class Account {
	private constructor(
		private readonly id: string,
		private readonly rootEmail: string,
		private creditsUsd: number,
		private users: User[],
		private apiKeys: string[],
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
		if (this.creditsUsd <= 0) {
			throw new Error("No remaining credits")
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

	generateApiKey(): string {
		const apiKey = crypto.randomBytes(32).toString("hex")
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

	static rehydrate(id: string, email: string, credits: number, users: User[], apiKeys: string[]): Account {
		return new Account(id, email, credits, users, apiKeys)
	}

	static create(rootEmail: string, user: User, freeCreditsUsd: number): Account {
		const id = uuidv4()

		if (freeCreditsUsd < 0) {
			throw new Error("Free credits must be greater than or equal to 0")
		}

		if (freeCreditsUsd > 5) {
			throw new Error("Free credits must be less than or equal to $5")
		}

		return new Account(id, rootEmail, freeCreditsUsd, [user], [])
	}
}
