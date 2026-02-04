import { Account } from "@domain/account"

export interface AccountService {
	createAccount(userEmail: string, freeCreditsUsd: number): Promise<Account>
	getAccount(userEmail: string): Promise<Account | null>
}