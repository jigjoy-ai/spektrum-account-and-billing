import { EmailSender } from "@app/ports/services/email-sender"
import { Email } from "@domain/email"

export class InMemoryEmailSender implements EmailSender {
	private sentEmails: Email[] = []
	private shouldFail: boolean = false
	private failureError: Error = new Error("Email service unavailable")

	async sendEmail(email: Email): Promise<void> {
		if (this.shouldFail) {
			throw this.failureError
		}

		// Store a copy of the email
		const emailCopy = new Email(
			email.getRecipient(),
			email.getSender(),
			email.getSubject(),
			email.getBody(),
		)
		this.sentEmails.push(emailCopy)
	}

	// Helper methods for testing
	getSentEmails(): Email[] {
		return [...this.sentEmails]
	}

	getLastSentEmail(): Email | undefined {
		return this.sentEmails[this.sentEmails.length - 1]
	}

	setShouldFail(shouldFail: boolean, error?: Error): void {
		this.shouldFail = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	clear(): void {
		this.sentEmails = []
		this.shouldFail = false
		this.failureError = new Error("Email service unavailable")
	}
}
