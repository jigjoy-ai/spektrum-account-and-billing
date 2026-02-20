import { createProcessCreditsPurchaseHandler } from "@infra/http/factories/process-credits-purchase"
import { ProcessCreditsPurchaseUseCase } from "@app/ports/use-cases/process-credits-purchase"
import { ProcessCreditsPurchase } from "@app/use-cases/process-credits-purchase"
import { organizationRepository } from "@infra/repositories/organization-repository"

export const processCreditsPurchase: ProcessCreditsPurchaseUseCase = new ProcessCreditsPurchase(organizationRepository)

export const handler = createProcessCreditsPurchaseHandler(processCreditsPurchase)
