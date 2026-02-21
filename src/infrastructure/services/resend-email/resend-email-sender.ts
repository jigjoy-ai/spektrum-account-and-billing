import { EmailSender } from "@app/ports/services/email-sender"
import { Email } from "@domain/email"
import { Resend } from "resend"

export class ResendEmailSender implements EmailSender {
    private readonly resend: Resend
    
	constructor() {
		try {
			this.resend = new Resend(process.env.RESEND_API_KEY)
		} catch (error) {
			console.error(`Failed to initialize Resend email sender: ${error}`)
		}
    }

	async sendEmail(email: Email): Promise<void> {

		console.log(`Sending email ${JSON.stringify(email)}`)
        
		const { data, error } = await this.resend.emails.send({
			from: email.getSender(),
			to: email.getRecipient(),
			subject: email.getSubject(),
			html: email.getBody(),
		})

		if (error) {
			throw new Error(`Failed to send email: ${error.message}`)
		}

		console.log(`Email sent successfully: ${JSON.stringify(data)}`)
	}
}