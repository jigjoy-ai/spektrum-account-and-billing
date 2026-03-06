import { Auth } from "@heksagon/app"
import { UserData } from "@jigjoy-ai/auth"
import { FetchTransactionsParams, FetchTransactionsUseCase } from "../ports/use-cases/fetch-transactions"
import { TransactionRepository } from "@app/ports/repositories/transaction-repository"
import { Transaction } from "@domain/transaction"
import { PaginatedResult } from "@app/value-objects/pagination"

export class FetchTransactions implements FetchTransactionsUseCase {
    constructor(private readonly transactionRepository: TransactionRepository) {}

    async execute(auth: Auth<UserData>, params: FetchTransactionsParams): Promise<PaginatedResult<Transaction>> {
        const organizationId = auth.data.organizationId as string
        const pagination = params.pagination

        return this.transactionRepository.getByOrganizationId(organizationId, pagination)
    }
}