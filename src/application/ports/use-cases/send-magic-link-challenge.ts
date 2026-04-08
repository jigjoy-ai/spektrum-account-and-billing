import { UseCase } from "@heksagon/app"

export type SendMagicLinkChallengeParams = {
	email: string
	sdkOnboarding?: boolean
}

export type SendMagicLinkChallengeUseCase = UseCase<SendMagicLinkChallengeParams, void>