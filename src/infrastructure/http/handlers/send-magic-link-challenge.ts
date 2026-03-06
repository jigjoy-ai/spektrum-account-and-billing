import { createSendMagicLinkChallengeHandler } from "@infra/http/factories/send-magic-link-challenge"
import { SendMagicLinkChallenge } from "@app/use-cases/send-magic-link-challenge"
import { SendMagicLinkChallengeUseCase } from "@app/ports/use-cases/send-magic-link-challenge"
import { resendEmailSender } from "@infra/services/resend-email"
import { identityManagementService } from "@infra/services/cognito-identity-management"
import { organizationRepository } from "@infra/repositories/organization-repository"
import { templateRepository } from "@infra/repositories/html-email-template-repository"

const PLATFORM_URL = process.env.PLATFORM_URL as string
const FROM_ADDRESS = process.env.FROM_ADDRESS as string

export const sendMagicLinkChallengeUseCase: SendMagicLinkChallengeUseCase = new SendMagicLinkChallenge(
	resendEmailSender,
	identityManagementService,
	organizationRepository,
	FROM_ADDRESS,
	PLATFORM_URL,
	templateRepository,
)

export const handler = createSendMagicLinkChallengeHandler(sendMagicLinkChallengeUseCase)
