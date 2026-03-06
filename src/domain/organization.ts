import { v4 as uuidv4 } from "uuid"
import { User } from "./user"

export class Organization {
	private constructor(
		private readonly id: string,
		private readonly ownerId: string,
		private creditsUsd: number,
		private members: User[]
	) {}

	getId(): string {
		return this.id
	}

	getOwnerId(): string {
		return this.ownerId
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

	getMembers(): User[] {
		return this.members
	}

	static rehydrate(id: string, ownerId: string, credits: number, members: User[]): Organization {
		return new Organization(id, ownerId, credits, members)
	}

	static create(owner: User, freeCreditsUsd: number): Organization {
		const id = uuidv4()

		if (freeCreditsUsd < 0) {
			throw new Error("Free credits must be greater than or equal to 0")
		}

		if (freeCreditsUsd > 5) {
			throw new Error("Free credits must be less than or equal to $5")
		}

		return new Organization(id, owner.getId(), freeCreditsUsd, [owner])
	}
}
