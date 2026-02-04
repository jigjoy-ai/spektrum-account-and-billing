import { AccountService } from "@app/ports/services/account-service"
import { Account } from "@domain/account"
import { IdentityManagementService } from "@app/ports/services/identity-management-service"

export class InMemoryAccountService implements AccountService {
	private accounts: Map<string, Account> = new Map()

	// Failure injection flags
	private shouldFailOnCreateAccount: boolean = false
	private shouldFailOnGetAccount: boolean = false
	private failureError: Error = new Error("Account service unavailable")

	constructor(private readonly identityManagementService: IdentityManagementService) {}

	async createAccount(userEmail: string, freeCreditsUsd: number): Promise<Account> {
		if (this.shouldFailOnCreateAccount) {
			throw this.failureError
		}

		// Create user (identityManagementService.create handles existing users)
		const user = await this.identityManagementService.create(userEmail)

		// Create account
		const account = Account.create(userEmail, freeCreditsUsd)
		account.addUser(user)
		this.accounts.set(userEmail, account)
		return account
	}

	async getAccount(userEmail: string): Promise<Account | null> {
		if (this.shouldFailOnGetAccount) {
			throw this.failureError
		}

		return this.accounts.get(userEmail) ?? null
	}

	// Helper methods for testing
	getAccounts(): Account[] {
		return Array.from(this.accounts.values())
	}

	getAccountByEmail(email: string): Account | undefined {
		return this.accounts.get(email)
	}

	setShouldFailOnCreateAccount(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnCreateAccount = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnGetAccount(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnGetAccount = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	clear(): void {
		this.accounts.clear()
		this.shouldFailOnCreateAccount = false
		this.shouldFailOnGetAccount = false
		this.failureError = new Error("Account service unavailable")
	}
}
