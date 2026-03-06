import { PaginatedResult, Pagination } from "@app/value-objects/pagination"
import { Transaction } from "@domain/transaction"

export interface TransactionRepository {
    save(transaction: Transaction): Promise<Transaction>
    getById(id: string): Promise<Transaction | null>
    getByOrganizationId(organizationId: string, pagination: Pagination): Promise<PaginatedResult<Transaction>>
}