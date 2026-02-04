import { Account } from "@domain/account"
import { User } from "@domain/user"
import { AccountRecord, UserRecord } from "@infra/repositories/records/account-record"

export class AccountMapper {
	static toRecord(account: Account): AccountRecord {
		return {
			id: account.getId(),
			rootEmail: account.getRootEmail(),
			creditsUsd: account.getRemainingCredits(),
			users: account.getUsers().map((u) => ({ id: u.getId(), email: u.getEmail() })),
			apiKeys: account.getApiKeys(),
		}
	}

	static toDomain(record: AccountRecord): Account {
		const users = record.users.map((u: UserRecord) => User.rehydrate(u.id, u.email))
		return Account.rehydrate(record.id, record.rootEmail, record.creditsUsd, users, record.apiKeys)
	}
}
