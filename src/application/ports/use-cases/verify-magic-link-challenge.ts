import { AuthSession } from "@domain/auth-session"
import { UseCase } from "@heksagon/app"

export type VerifyMagicLinkChallengeParams = {
	email: string
	challenge: string
}

export type VerifyMagicLinkChallengeUseCase = UseCase<VerifyMagicLinkChallengeParams, AuthSession>