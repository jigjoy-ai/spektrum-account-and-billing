import { UseCase } from "@heksagon/app"

export type SendMagicLinkChallengeParams = {
	email: string
}

export type SendMagicLinkChallengeUseCase = UseCase<SendMagicLinkChallengeParams, void>