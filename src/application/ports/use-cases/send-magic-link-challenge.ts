import { UseCase } from "@heksagon/app"

export type SendMagicLinkChallengeParams = {
	email: string
	sdkUser?: boolean
}

export type SendMagicLinkChallengeUseCase = UseCase<SendMagicLinkChallengeParams, void>