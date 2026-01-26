import { createVerifyMagicLinkChallengeHandler } from "@infra/http/factories/verify-magic-link-challenge"
import { verifyMagicLinkChallengeUseCase } from "@infra/dependencies"

export const handler = createVerifyMagicLinkChallengeHandler(verifyMagicLinkChallengeUseCase)
