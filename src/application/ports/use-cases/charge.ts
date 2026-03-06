import { AuthenticatedUseCase } from "@heksagon/app"
import { UserData } from "@jigjoy-ai/auth"

export type ChargeParams = {
	providerCostUsd: number
}

export type ChargeResponse = number

export type ChargeUseCase = AuthenticatedUseCase<UserData, ChargeParams, ChargeResponse>