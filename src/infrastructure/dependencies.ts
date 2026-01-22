import { SendMagicLink } from "@app/use-cases/send-magic-link"
import { SendgridEmailSender } from "./services/sendgrid-email-sender"
import { SendMagicLinkUseCase } from "@app/ports/use-cases/send-magic-link"
import { CognitoUserPool } from "./repositories/cognito-identity-management"
import { AccountStore } from "@app/ports/services/identity-management-service"
import { MagicLinkService } from "@app/services/magic-link-service"
import { KMSTokenService } from "./services/token-service"
import { TokenService } from "@app/ports/services/token-service"

const sendgridEmailSender = new SendgridEmailSender()

const USER_POOL_ID = process.env.USER_POOL_ID as string
const cognitoUserPool: AccountStore = new CognitoUserPool(USER_POOL_ID)

const KMS_KEY_ID = process.env.KMS_KEY_ID as string
const tokenService: TokenService = new KMSTokenService(KMS_KEY_ID)

const DESTINATION_URL = process.env.DESTINATION_URL as string
const magicLinkService: MagicLinkService = new MagicLinkService(tokenService, DESTINATION_URL)

const FROM_ADDRESS = process.env.FROM_ADDRESS as string
export const sendMagicLinkUseCase: SendMagicLinkUseCase = new SendMagicLink(
	sendgridEmailSender,
	cognitoUserPool,
	magicLinkService,
	FROM_ADDRESS,
)
