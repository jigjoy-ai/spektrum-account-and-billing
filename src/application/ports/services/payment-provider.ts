export interface PaymentProvider {
    getInvoicePdfUrl(transactionId: string): Promise<string>
}