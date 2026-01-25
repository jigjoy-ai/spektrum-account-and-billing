import { createSendMagicLinkChallengeHandler } from "@infra/http/factories/send-magic-link-challenge"
import { sendMagicLinkChallengeUseCase } from "@infra/dependencies"

export const handler = createSendMagicLinkChallengeHandler(sendMagicLinkChallengeUseCase)
