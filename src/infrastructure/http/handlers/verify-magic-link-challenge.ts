import { VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"
import { VerifyMagicLinkChallenge } from "@app/use-cases/verify-magic-link-challenge"
import { createVerifyMagicLinkChallengeHandler } from "@infra/http/factories/verify-magic-link-challenge"
import { accountRepository } from "@infra/repositories/account-repository"
import { apiKeyRepository } from "@infra/repositories/api-key-repository"
import { identityManagementService } from "@infra/services/cognito-identity-management"

export const verifyMagicLinkChallengeUseCase: VerifyMagicLinkChallengeUseCase = new VerifyMagicLinkChallenge(
	identityManagementService,
	accountRepository,
	apiKeyRepository,
)

export const handler = createVerifyMagicLinkChallengeHandler(verifyMagicLinkChallengeUseCase)
