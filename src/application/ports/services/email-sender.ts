import { Email } from "@domain/email"

export interface EmailSender {
	sendEmail(email: Email): Promise<void>
}
