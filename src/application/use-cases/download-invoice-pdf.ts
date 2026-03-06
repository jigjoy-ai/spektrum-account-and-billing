import { TransactionRepository } from "@app/ports/repositories/transaction-repository"
import { PaymentProvider } from "@app/ports/services/payment-provider"
import { DownloadInvoicePdfParams, DownloadInvoicePdfUseCase } from "@app/ports/use-cases/download-invoice-pdf"
import { Auth } from "@heksagon/app"
import { UserData } from "@jigjoy-ai/auth"

export class DownloadInvoicePdf implements DownloadInvoicePdfUseCase {
    constructor(private readonly transactionRepository: TransactionRepository, private readonly paymentProvider: PaymentProvider) {}

    async execute(auth: Auth<UserData>, params: DownloadInvoicePdfParams): Promise<Buffer> {
        const transaction = await this.transactionRepository.getById(params.transactionId)
        if (!transaction) {
            throw new Error("Transaction not found")
        }

        if(transaction.getOrganizationId() !== auth.data.organizationId) {
            throw new Error("Not authorized to download invoice PDF")
        }

        const invoicePdfUrl = await this.paymentProvider.getInvoicePdfUrl(params.transactionId)

        const response = await fetch(invoicePdfUrl)
        if (!response.ok) {
            throw new Error("Failed to download invoice PDF")
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        return buffer
    }
}