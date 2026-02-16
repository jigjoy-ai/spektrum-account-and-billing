import { describe, it, expect, beforeEach } from "@rstest/core"
import { ResendEmailSender } from "@infra/services/resend-email-sender/resend-email-sender"
import { Email } from "@domain/email"

describe("Resend Email Sender - Unit", () => {
	it("should instantiate without error when RESEND_API_KEY is set", () => {
		const original = process.env.RESEND_API_KEY
		process.env.RESEND_API_KEY = "re_test_fake_key"

		try {
			const sender = new ResendEmailSender()
			expect(sender).toBeDefined()
		} finally {
			if (original) {
				process.env.RESEND_API_KEY = original
			} else {
				delete process.env.RESEND_API_KEY
			}
		}
	})

	it("should reject when sending with an invalid API key", async () => {
		const original = process.env.RESEND_API_KEY
		process.env.RESEND_API_KEY = "re_invalid_key"

		try {
			const sender = new ResendEmailSender()
			const email = new Email(
				"test@example.com",
				"team@mail.jigjoy.ai",
				"Test Subject",
				"<p>Test body</p>",
			)

			await expect(sender.sendEmail(email)).rejects.toThrow()
		} finally {
			if (original) {
				process.env.RESEND_API_KEY = original
			} else {
				delete process.env.RESEND_API_KEY
			}
		}
	})
})
