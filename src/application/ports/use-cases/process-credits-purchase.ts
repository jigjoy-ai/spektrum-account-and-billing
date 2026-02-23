import { UseCase } from "@heksagon/app"

export type ProcessCreditsPurchaseParams = {
    creditAmount: number
    organizationId: string
}

export type ProcessCreditsPurchaseUseCase = UseCase<ProcessCreditsPurchaseParams, void>