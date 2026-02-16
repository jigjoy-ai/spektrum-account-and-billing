import { describe, it, expect, beforeEach } from "@rstest/core"
import { ResendEmailSender } from "@infra/services/resend-email-sender/resend-email-sender"
import { LoginEmailFactory } from "@domain/login-email-factory"
import { Email } from "@domain/email"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe("Resend Email Sender - Integration", () => {
	let emailSender: ResendEmailSender

	const resendApiKey = process.env.RESEND_API_KEY as string
	const testRecipientEmail = process.env.TEST_RECIPIENT_EMAIL || "test@example.com"
	const testSenderEmail = process.env.FROM_ADDRESS || "team@mail.jigjoy.ai"

	beforeEach(async () => {
		if (!resendApiKey) {
			console.warn("RESEND_API_KEY not set — skipping Resend integration tests")
			return
		}
		// Avoid Resend rate limits (2 req/s on free tier)
		await delay(1000)
		emailSender = new ResendEmailSender()
	})

	it("should send an email successfully", async () => {
		if (!resendApiKey) return

		const email = new Email(
			testRecipientEmail,
			testSenderEmail,
			"Test Subject",
			"<p>This is a test email body</p>",
		)

		await expect(emailSender.sendEmail(email)).resolves.not.toThrow()
	})

	it("should send email with HTML body", async () => {
		if (!resendApiKey) return

		const htmlBody = "<html><body><h1>Test</h1><p>HTML content</p></body></html>"
		const email = new Email(testRecipientEmail, testSenderEmail, "HTML Test Subject", htmlBody)

		await expect(emailSender.sendEmail(email)).resolves.not.toThrow()
	})

	it("should send email with all email properties correctly", async () => {
		if (!resendApiKey) return

		const email = new Email(
			testRecipientEmail,
			testSenderEmail,
			"Integration Test Email",
			"<p>Test body content</p>",
		)

		await expect(emailSender.sendEmail(email)).resolves.not.toThrow()
	})

	it("should handle sending multiple emails", async () => {
		if (!resendApiKey) return

		const email1 = new Email(testRecipientEmail, testSenderEmail, "First Email", "<p>First email body</p>")
		const email2 = new Email(testRecipientEmail, testSenderEmail, "Second Email", "<p>Second email body</p>")

		await expect(emailSender.sendEmail(email1)).resolves.not.toThrow()
		await delay(1000)
		await expect(emailSender.sendEmail(email2)).resolves.not.toThrow()
	})

	it("should send the React Email magic link template", async () => {
		if (!resendApiKey) return

		const email = LoginEmailFactory.create({
			recipient: testRecipientEmail,
			sender: testSenderEmail,
			loginLink: "https://dev-spektrum.jigjoy.ai/workspace?token=example-magic-link-token-123",
			expirationInMinutes: 5,
		})

		await expect(emailSender.sendEmail(email)).resolves.not.toThrow()
	})

	it("should throw error when Resend API call fails with invalid key", async () => {
		const originalApiKey = process.env.RESEND_API_KEY
		process.env.RESEND_API_KEY = "re_invalid_api_key"

		try {
			const invalidSender = new ResendEmailSender()
			const email = new Email(
				"invalid@example.com",
				testSenderEmail,
				"Test Subject",
				"<p>Test body</p>",
			)

			await expect(invalidSender.sendEmail(email)).rejects.toThrow()
		} finally {
			if (originalApiKey) {
				process.env.RESEND_API_KEY = originalApiKey
			} else {
				delete process.env.RESEND_API_KEY
			}
		}
	})
})
