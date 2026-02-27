import { AuthenticatedUseCase } from "@heksagon/app"
import { UserData } from "@jigjoy-ai/auth"

export type DownloadInvoicePdfParams = {
    transactionId: string
}

export type DownloadInvoicePdfUseCase = AuthenticatedUseCase<UserData, DownloadInvoicePdfParams, Buffer>