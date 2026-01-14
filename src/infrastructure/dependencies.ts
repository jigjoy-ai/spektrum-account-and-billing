import { SendMagicLink } from "@app/use-cases/send-magic-link"
import { SendgridEmailSender } from "./services/sendgrid-email-sender"
import { SendMagicLinkUseCase } from "@app/ports/use-cases/send-magic-link"
import { CognitoUserPool } from "./repositories/cognito-user-pool"
import { AccountStore } from "@app/ports/repositories/account-store"
import { DefaultMagicLinkService } from "./services/magic-link-service"
import { MagicLinkService } from "@app/ports/services/magic-link-service"

const sendgridEmailSender = new SendgridEmailSender()

const USER_POOL_ID = process.env.USER_POOL_ID as string
if (!USER_POOL_ID) {
	throw new Error("USER_POOL_ID is not set")
}
const cognitoUserPool: AccountStore = new CognitoUserPool(USER_POOL_ID)
const magicLinkService: MagicLinkService = new DefaultMagicLinkService()
export const sendMagicLinkUseCase: SendMagicLinkUseCase = new SendMagicLink(
	sendgridEmailSender,
	cognitoUserPool,
	magicLinkService,
)
