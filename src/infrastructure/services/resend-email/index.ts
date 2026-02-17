import { EmailSender } from "@app/ports/services/email-sender"
import { ResendEmailSender } from "@infra/services/resend-email/resend-email-sender"

export const resendEmailSender: EmailSender = new ResendEmailSender()
