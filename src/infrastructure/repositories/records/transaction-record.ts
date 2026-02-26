export interface TransactionRecord {
	id: string
	organizationId: string
	amount: number
	status: string
	invoicePdfUrl: string
	createdAt: string
}
