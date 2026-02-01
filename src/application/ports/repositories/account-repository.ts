import { Account } from "@domain/account"

export interface AccountRepository {
	save(account: Account): Promise<void>
	getByEmail(email: string): Promise<Account>
	exists(email: string): Promise<boolean>
}
