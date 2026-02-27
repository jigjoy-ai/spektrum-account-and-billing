import { PaginatedResult, Pagination } from "@app/value-objects/pagination"
import { Transaction } from "@domain/transaction"
import { AuthenticatedUseCase } from "@heksagon/app"
import { UserData } from "@jigjoy-ai/auth"

export type FetchTransactionsParams = {
    pagination: Pagination
}

export type FetchTransactionsUseCase = AuthenticatedUseCase<UserData, FetchTransactionsParams, PaginatedResult<Transaction>>