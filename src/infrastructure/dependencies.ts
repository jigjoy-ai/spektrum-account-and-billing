import { GetMagicLinkUseCase } from "@app/use-cases/get-magic-link"
import { SendgridEmailSender } from "./services/sendgrid-email-sender"
import { GetMagicLinkPort } from "@app/ports/use-cases/get-magic-link"

const sendgridEmailSender = new SendgridEmailSender()
export const getMagicLinkUseCase: GetMagicLinkPort = new GetMagicLinkUseCase(sendgridEmailSender)