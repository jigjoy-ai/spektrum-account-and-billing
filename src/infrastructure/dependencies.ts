import { SendMagicLinkChallenge } from "@app/use-cases/send-magic-link-challenge"
import { SendgridEmailSender } from "./services/sendgrid-email-sender/sendgrid-email-sender"
import { SendMagicLinkChallengeUseCase } from "@app/ports/use-cases/send-magic-link-challenge"
import { CognitoIdentityManagementService } from "./services/cognito-identity-management/cognito-identity-management"
import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { MagicLinkService } from "@app/services/magic-link-service"
import { KMSTokenService } from "./services/kms-token-service/kms-token-service"
import { TokenService } from "@app/ports/services/token-service"
import { VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"
import { VerifyMagicLinkChallenge } from "@app/use-cases/verify-magic-link-challenge"

const sendgridEmailSender = new SendgridEmailSender()

const USER_POOL_ID = process.env.USER_POOL_ID as string
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID as string
const identityManagementService: IdentityManagementService = new CognitoIdentityManagementService(USER_POOL_ID, USER_POOL_CLIENT_ID)

const KMS_KEY_ID = process.env.KMS_KEY_ID as string
const tokenService: TokenService = new KMSTokenService(KMS_KEY_ID)

const DESTINATION_URL = process.env.DESTINATION_URL as string
const magicLinkService: MagicLinkService = new MagicLinkService(tokenService, DESTINATION_URL)

const FROM_ADDRESS = process.env.FROM_ADDRESS as string
export const sendMagicLinkChallengeUseCase: SendMagicLinkChallengeUseCase = new SendMagicLinkChallenge(
	sendgridEmailSender,
	identityManagementService,
	magicLinkService,
	FROM_ADDRESS,
)

export const verifyMagicLinkChallengeUseCase: VerifyMagicLinkChallengeUseCase = new VerifyMagicLinkChallenge(
	identityManagementService,
)