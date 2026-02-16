import { EmailSender } from "@app/ports/services/email-sender"
import { Resend } from "resend"
import { Email } from "@domain/email"

export class ResendEmailSender implements EmailSender {
	private resend: Resend | null = null

	private getClient(): Resend {
		if (!this.resend) {
			this.resend = new Resend(process.env.RESEND_API_KEY as string)
		}
		return this.resend
	}

	async sendEmail(email: Email): Promise<void> {
		await this.getClient().emails.send({
			from: email.getSender(),
			to: email.getRecipient(),
			subject: email.getSubject(),
			html: email.getBody(),
		})
	}
}
