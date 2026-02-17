import { ChargeUseCase } from "@app/ports/use-cases/charge"
import { Charge } from "@app/use-cases/charge"
import { createChargeHandler } from "@infra/http/factories/charge"
import { accountRepository } from "@infra/repositories/account-repository"

export const chargeUseCase: ChargeUseCase = new Charge(accountRepository)

export const handler = createChargeHandler(chargeUseCase)
