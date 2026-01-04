import { Account } from "@domain/account"

export interface AccountStorePort {
	create(account: Account): Promise<void>
	findByEmail(email: string): Promise<Account | null>
	setAuthChallenge(email: string, challenge: string): Promise<void>
}
