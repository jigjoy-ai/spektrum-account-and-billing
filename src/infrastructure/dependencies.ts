import { SendMagicLink } from "@app/use-cases/send-magic-link"
import { SendgridEmailSender } from "./services/sendgrid-email-sender"
import { SendMagicLinkUseCase } from "@app/ports/use-cases/send-magic-link"
import { CognitoIdentityManagementService } from "./services/cognito-identity-management/cognito-identity-management"
import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { MagicLinkService } from "@app/services/magic-link-service"
import { KMSTokenService } from "./services/token-service"
import { TokenService } from "@app/ports/services/token-service"

const sendgridEmailSender = new SendgridEmailSender()

const USER_POOL_ID = process.env.USER_POOL_ID as string
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID as string
const identityManagementService: IdentityManagementService = new CognitoIdentityManagementService(USER_POOL_ID, USER_POOL_CLIENT_ID)

const KMS_KEY_ID = process.env.KMS_KEY_ID as string
const tokenService: TokenService = new KMSTokenService(KMS_KEY_ID)

const DESTINATION_URL = process.env.DESTINATION_URL as string
const magicLinkService: MagicLinkService = new MagicLinkService(tokenService, DESTINATION_URL)

const FROM_ADDRESS = process.env.FROM_ADDRESS as string
export const sendMagicLinkUseCase: SendMagicLinkUseCase = new SendMagicLink(
	sendgridEmailSender,
	identityManagementService,
	magicLinkService,
	FROM_ADDRESS,
)
