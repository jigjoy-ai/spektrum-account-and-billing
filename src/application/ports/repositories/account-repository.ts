import { Account } from "@domain/account"

export interface AccountRepository {
	save(account: Account): Promise<Account>
	getByEmail(email: string): Promise<Account | null>
	getById(id: string): Promise<Account | null>
	exists(email: string): Promise<boolean>
}
