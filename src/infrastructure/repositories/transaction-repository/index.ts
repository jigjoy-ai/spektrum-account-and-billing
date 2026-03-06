import { TransactionRepository } from "@app/ports/repositories/transaction-repository"
import { DynamoDBTransactionRepository } from "./dynamodb-transaction-repository"

export const transactionRepository: TransactionRepository = new DynamoDBTransactionRepository()