import { GetCreditBalance } from "@app/use-cases/get-credit-balance"
import { createGetCreditBalanceHandler } from "../factories/get-credit-balance"
import { organizationRepository } from "@infra/repositories/organization-repository"
import { GetCreditBalanceUseCase } from "@app/ports/use-cases/get-credit-balance"

const getCreditBalance: GetCreditBalanceUseCase = new GetCreditBalance(organizationRepository)
export const handler = createGetCreditBalanceHandler(getCreditBalance)
