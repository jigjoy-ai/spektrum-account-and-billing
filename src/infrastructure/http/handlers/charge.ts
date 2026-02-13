import { chargeUseCase } from "@infra/dependencies"
import { createChargeHandler } from "@infra/http/factories/charge"

export const handler = createChargeHandler(chargeUseCase)
