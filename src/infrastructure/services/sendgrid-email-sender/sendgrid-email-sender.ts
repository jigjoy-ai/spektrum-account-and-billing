import { EmailSender } from "@app/ports/services/email-sender"
import sgMail from "@sendgrid/mail"
import { Email } from "@domain/email"

export class SendgridEmailSender implements EmailSender {
	constructor() {
		const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY as string
		sgMail.setApiKey(SENDGRID_API_KEY)
		// sgMail.setDataResidency('eu');
		// uncomment the above line if you are sending mail using a regional EU subuser
	}

	async sendEmail(email: Email): Promise<void> {
		const msg = {
			to: email.getRecipient(),
			from: email.getSender(),
			subject: email.getSubject(),
			html: email.getBody(),
		}

		await sgMail.send(msg)
	}
}
