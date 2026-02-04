import { AccountRepository } from "@app/ports/repositories/account-repository"
import { Account } from "@domain/account"

export class DynamoDBAccountRepository implements AccountRepository {
	constructor() {}

	async getByEmail(email: string): Promise<Account | null> {
		throw new Error("Method not implemented.")
	}
	exists(email: string): Promise<boolean> {
		throw new Error("Method not implemented.")
	}

	async save(account: Account): Promise<Account> {
		throw new Error("Method not implemented.")
	}
}
