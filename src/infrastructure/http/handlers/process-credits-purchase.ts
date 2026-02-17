import { createProcessCreditsPurchaseHandler } from "@infra/http/factories/process-credits-purchase"
import { ProcessCreditsPurchaseUseCase } from "@app/ports/use-cases/process-credits-purchase"
import { ProcessCreditsPurchase } from "@app/use-cases/process-credits-purchase"
import { accountRepository } from "@infra/repositories/account-repository"

export const processCreditsPurchase: ProcessCreditsPurchaseUseCase = new ProcessCreditsPurchase(accountRepository)

export const handler = createProcessCreditsPurchaseHandler(processCreditsPurchase)
