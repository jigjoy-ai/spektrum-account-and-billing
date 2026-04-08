import { UseCase } from "@heksagon/app"

export type SendMagicLinkChallengeParams = {
	email: string
	onboarding?: boolean
}

export type SendMagicLinkChallengeUseCase = UseCase<SendMagicLinkChallengeParams, void>