import { Email } from "@domain/email"

export interface EmailSenderPort {
	sendEmail(email: Email): Promise<void>
}
