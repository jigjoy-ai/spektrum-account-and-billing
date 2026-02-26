import { createProcessCreditsPurchaseHandler } from "@infra/http/factories/process-credits-purchase"
import { ProcessCreditsPurchaseUseCase } from "@app/ports/use-cases/process-credits-purchase"
import { ProcessCreditsPurchase } from "@app/use-cases/process-credits-purchase"
import { organizationRepository } from "@infra/repositories/organization-repository"
import { resendEmailSender } from "@infra/services/resend-email"
import { PaddlePaymentProvider } from "@infra/services/paddle/paddle-payment-provider"
import { transactionRepository } from "@infra/repositories/transaction-repository"

const FROM_ADDRESS = process.env.FROM_ADDRESS as string

const paddlePaymentProvider = new PaddlePaymentProvider()
export const processCreditsPurchase: ProcessCreditsPurchaseUseCase = new ProcessCreditsPurchase(resendEmailSender, FROM_ADDRESS, organizationRepository, paddlePaymentProvider, transactionRepository)

export const handler = createProcessCreditsPurchaseHandler(processCreditsPurchase)
