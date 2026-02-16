import { EmailSender } from "@app/ports/services/email-sender"
import { Resend } from "resend"
import { Email } from "@domain/email"

export class ResendEmailSender implements EmailSender {
	private readonly resend: Resend

	constructor() {
		const RESEND_API_KEY = process.env.RESEND_API_KEY as string
		this.resend = new Resend(RESEND_API_KEY)
	}

	async sendEmail(email: Email): Promise<void> {
		await this.resend.emails.send({
			from: email.getSender(),
			to: email.getRecipient(),
			subject: email.getSubject(),
			html: email.getBody(),
		})
	}
}
