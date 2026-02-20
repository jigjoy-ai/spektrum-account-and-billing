import { ChargeUseCase } from "@app/ports/use-cases/charge"
import { Charge } from "@app/use-cases/charge"
import { createChargeHandler } from "@infra/http/factories/charge"
import { organizationRepository } from "@infra/repositories/organization-repository"

export const chargeUseCase: ChargeUseCase = new Charge(organizationRepository)

export const handler = createChargeHandler(chargeUseCase)
