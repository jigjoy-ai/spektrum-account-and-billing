import { AccountStore } from "@app/ports/services/identity-management-service"
import { Account } from "@domain/account"

export class InMemoryAccountStore implements AccountStore {
	private accounts: Map<string, Account> = new Map()
	private authChallenges: Map<string, string> = new Map()
	private shouldFailOnCreate: boolean = false
	private shouldFailOnFindByEmail: boolean = false
	private shouldFailOnSetAuthChallenge: boolean = false
	private failureError: Error = new Error("Account store unavailable")

	async create(account: Account): Promise<void> {
		if (this.shouldFailOnCreate) {
			throw this.failureError
		}

		const email = account.getEmail()
		// Store a copy of the account
		const accountCopy = Account.rehydrate(email)
		this.accounts.set(email, accountCopy)
	}

	async findByEmail(email: string): Promise<Account | null> {
		if (this.shouldFailOnFindByEmail) {
			throw this.failureError
		}

		const account = this.accounts.get(email)
		if (!account) {
			return null
		}
		// Return a copy
		return Account.rehydrate(account.getEmail())
	}

	async setAuthChallenge(email: string, challenge: string): Promise<void> {
		if (this.shouldFailOnSetAuthChallenge) {
			throw this.failureError
		}

		this.authChallenges.set(email, challenge)
	}

	// Helper methods for testing
	getAuthChallenge(email: string): string | undefined {
		return this.authChallenges.get(email)
	}

	hasAccount(email: string): boolean {
		return this.accounts.has(email)
	}

	setShouldFailOnCreate(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnCreate = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnFindByEmail(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnFindByEmail = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnSetAuthChallenge(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnSetAuthChallenge = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	clear(): void {
		this.accounts.clear()
		this.authChallenges.clear()
		this.shouldFailOnCreate = false
		this.shouldFailOnFindByEmail = false
		this.shouldFailOnSetAuthChallenge = false
		this.failureError = new Error("Account store unavailable")
	}
}
