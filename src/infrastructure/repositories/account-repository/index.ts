import { AccountRepository } from "@app/ports/repositories/account-repository"
import { DynamoDBAccountRepository } from "@infra/repositories/account-repository/dynamodb-account-repository"

export const accountRepository: AccountRepository = new DynamoDBAccountRepository()
