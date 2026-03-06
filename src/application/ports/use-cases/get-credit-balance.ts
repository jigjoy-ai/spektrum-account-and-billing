import { AuthenticatedUseCase } from "@heksagon/app"
import { UserData } from "@jigjoy-ai/auth"

export type GetCreditBalanceUseCase = AuthenticatedUseCase<UserData, void, number>
