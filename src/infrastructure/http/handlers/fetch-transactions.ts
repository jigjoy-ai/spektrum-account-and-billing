import { FetchTransactionsUseCase } from "@app/ports/use-cases/fetch-transactions"
import { FetchTransactions } from "@app/use-cases/fetch-transactions"
import { transactionRepository } from "@infra/repositories/transaction-repository"
import { createFetchTransactionsHandler } from "@infra/http/factories/fetch-transactions"

export const fetchTransactionsUseCase: FetchTransactionsUseCase = new FetchTransactions(transactionRepository)

export const handler = createFetchTransactionsHandler(fetchTransactionsUseCase)
