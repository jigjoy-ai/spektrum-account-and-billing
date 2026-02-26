import { Transaction, TransactionStatus } from "@domain/transaction"
import { TransactionRecord } from "@infra/repositories/records/transaction-record"

export class TransactionMapper {
	static toRecord(transaction: Transaction): TransactionRecord {
		return {
			id: transaction.getId(),
			organizationId: transaction.getOrganizationId(),
			amount: transaction.getAmount(),
			status: transaction.getStatus(),
			invoicePdfUrl: transaction.getInvoicePdfUrl(),
			createdAt: transaction.getCreatedAt(),
		}
	}

	static toDomain(record: TransactionRecord): Transaction {
		return Transaction.rehydrate(
			record.id,
			record.organizationId,
			record.amount,
			record.status as TransactionStatus,
			record.invoicePdfUrl,
			record.createdAt,
		)
	}

	static toDomains(records: TransactionRecord[]): Transaction[] {
		return records.map((record) => TransactionMapper.toDomain(record))
	}
}
