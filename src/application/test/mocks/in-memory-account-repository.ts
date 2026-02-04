import { AccountRepository } from "@app/ports/repositories/account-repository"
import { Account } from "@domain/account"

export class InMemoryAccountRepository implements AccountRepository {
	private accounts: Map<string, Account> = new Map()

	async save(account: Account): Promise<Account> {
		this.accounts.set(account.getRootEmail(), account)
		return account
	}

	async getByEmail(email: string): Promise<Account | null> {
		const account = this.accounts.get(email)
		return account || null
	}

	async exists(email: string): Promise<boolean> {
		return this.accounts.has(email)
	}

	clear(): void {
		this.accounts.clear()
	}
}
