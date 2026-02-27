export enum TransactionStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}

export class Transaction {
    private constructor(
        private readonly id: string,
        private readonly organizationId: string,
        private readonly amount: number,
        private readonly status: TransactionStatus,
        private readonly createdAt: string,
    ) {}

    getId(): string {
        return this.id
    }

    getOrganizationId(): string {
        return this.organizationId
    }

    getAmount(): number {
        return this.amount
    }

    getStatus(): string {
        return this.status
    }

    getCreatedAt(): string {
        return this.createdAt
    }

    static createWithId(id: string, organizationId: string, amount: number, status: TransactionStatus): Transaction {
        const createdAt = new Date().toISOString()
        return new Transaction(id, organizationId, amount, status, createdAt)
    }

    static rehydrate(
        id: string,
        organizationId: string,
        amount: number,
        status: TransactionStatus,
        invoicePdfUrl: string,
        createdAt: string,
    ): Transaction {
        return new Transaction(id, organizationId, amount, status, createdAt)
    }
}