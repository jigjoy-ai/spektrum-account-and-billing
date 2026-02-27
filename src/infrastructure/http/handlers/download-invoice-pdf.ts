import { createDownloadInvoicePdfHandler } from "@infra/http/factories/download-invoice-pdf"
import { DownloadInvoicePdf } from "@app/use-cases/download-invoice-pdf"
import { transactionRepository } from "@infra/repositories/transaction-repository"
import { PaddlePaymentProvider } from "@infra/services/paddle/paddle-payment-provider"

const paddlePaymentProvider = new PaddlePaymentProvider()
export const downloadInvoicePdfUseCase = new DownloadInvoicePdf(transactionRepository, paddlePaymentProvider)

export const handler = createDownloadInvoicePdfHandler(downloadInvoicePdfUseCase)   