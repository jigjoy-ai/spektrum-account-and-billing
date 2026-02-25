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

	private async sendEmailWithAttachments(email: Email): Promise<void> {
		console.log(`Sending email with attachments to ${email.getRecipient()}`)

		const attachmentBuffers = await Promise.all(email.getAttachments().map(async (attachment) => {
			const response = await fetch(attachment.url)
			const arrayBuffer = await response.arrayBuffer()
			return Buffer.from(arrayBuffer)
		}))

		const attachments = email.getAttachments().map((attachment, index) => ({
			filename: attachment.filename,
			content: attachmentBuffers[index],
		}))

		const { data, error } = await this.resend.emails.send({
			from: email.getSender(),
			to: email.getRecipient(),
			subject: email.getSubject(),
			html: email.getBody(),
			attachments: attachments.length > 0 ? attachments : undefined,
		})

		if (error) {
			throw new Error(`Failed to send email: ${error.message}`)
		}

		console.log(`Email sent successfully: ${JSON.stringify(data)}`)
	}

	private async sendEmailWithoutAttachments(email: Email): Promise<void> {
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

	async sendEmail(email: Email): Promise<void> {
		if (email.getAttachments().length > 0) {
			await this.sendEmailWithAttachments(email)
		} else {
			await this.sendEmailWithoutAttachments(email)
		}
	}
}
