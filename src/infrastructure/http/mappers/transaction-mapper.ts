import { Transaction } from "@domain/transaction"
import { TransactionDTO } from "../dtos/transaction"

export class TransactionMapper {
    static toDto(transaction: Transaction): TransactionDTO {
        return {
            id: transaction.getId(),
            organizationId: transaction.getOrganizationId(),
            amount: transaction.getAmount(),
            status: transaction.getStatus(),
            invoicePdfUrl: transaction.getInvoicePdfUrl(),
            createdAt: transaction.getCreatedAt(),
        }
    }

    static toDtos(transactions: Transaction[]): TransactionDTO[] {
        return transactions.map((transaction) => TransactionMapper.toDto(transaction))
    }
}