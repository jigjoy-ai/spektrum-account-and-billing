import { SendMagicLinkUseCase } from "@app/use-cases/send-magic-link"
import { SendgridEmailSender } from "./services/sendgrid-email-sender"
import { SendMagicLinkPort } from "@app/ports/use-cases/send-magic-link"
import { CognitoUserPool } from "./repositories/cognito-user-pool"
import { AccountStorePort } from "@app/ports/repositories/account-store"
import { MagicLinkService } from "./services/magic-link-service"
import { MagicLinkServicePort } from "@app/ports/services/magic-link-service"

const sendgridEmailSender = new SendgridEmailSender()

const USER_POOL_ID  = process.env.USER_POOL_ID as string
if(!USER_POOL_ID) {
    throw new Error("USER_POOL_ID is not set")
}
const cognitoUserPool: AccountStorePort = new CognitoUserPool(USER_POOL_ID)
const magicLinkService: MagicLinkServicePort = new MagicLinkService()
export const sendMagicLinkUseCase: SendMagicLinkPort = new SendMagicLinkUseCase(sendgridEmailSender, cognitoUserPool, magicLinkService)