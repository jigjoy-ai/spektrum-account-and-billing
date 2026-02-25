import { UseCase } from "@heksagon/app"

export type ProcessCreditsPurchaseParams = {
    creditAmount: number
    organizationId: string
    transactionId: string
    email: string
}

export type ProcessCreditsPurchaseUseCase = UseCase<ProcessCreditsPurchaseParams, void>