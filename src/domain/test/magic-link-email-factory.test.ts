import { describe, it, expect } from "@rstest/core"
import { MagicLinkEmailFactory } from "@domain/magic-link-email-factory"
import { MagicLink } from "@domain/magic-link"
import { Email } from "@domain/email"

describe("MagicLinkEmailFactory", () => {
	describe("create", () => {
		it("should create an Email instance", () => {
			// Arrange
			const recipient = "user@example.com"
			const sender = "noreply@example.com"
			const magicLink = new MagicLink("https://example.com/login?token=abc123", 15)

			// Act
			const email = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink,
			})

			// Assert
			expect(email).toBeInstanceOf(Email)
		})

		it("should create an Email with the correct recipient", () => {
			// Arrange
			const recipient = "user@example.com"
			const sender = "noreply@example.com"
			const magicLink = new MagicLink("https://example.com/login?token=abc123", 15)

			// Act
			const email = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink,
			})

			// Assert
			expect(email.getRecipient()).toBe(recipient)
		})

		it("should create an Email with the correct sender", () => {
			// Arrange
			const recipient = "user@example.com"
			const sender = "noreply@example.com"
			const magicLink = new MagicLink("https://example.com/login?token=abc123", 15)

			// Act
			const email = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink,
			})

			// Assert
			expect(email.getSender()).toBe(sender)
		})

		it("should create an Email with the subject 'JigJoy Login Link'", () => {
			// Arrange
			const recipient = "user@example.com"
			const sender = "noreply@example.com"
			const magicLink = new MagicLink("https://example.com/login?token=abc123", 15)

			// Act
			const email = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink,
			})

			// Assert
			expect(email.getSubject()).toBe("JigJoy Login Link")
		})

		it("should create an Email body containing the expiration time", () => {
			// Arrange
			const recipient = "user@example.com"
			const sender = "noreply@example.com"
			const expiration = 30
			const magicLink = new MagicLink("https://example.com/login?token=abc123", expiration)

			// Act
			const email = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink,
			})

			// Assert
			expect(email.getBody()).toContain(`${expiration} mins`)
		})

		it("should create an Email body containing the login link", () => {
			// Arrange
			const recipient = "user@example.com"
			const sender = "noreply@example.com"
			const loginLink = "https://example.com/login?token=xyz789"
			const magicLink = new MagicLink(loginLink, 15)

			// Act
			const email = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink,
			})

			// Assert
			expect(email.getBody()).toContain(loginLink)
		})

		it("should create an Email body with HTML structure", () => {
			// Arrange
			const recipient = "user@example.com"
			const sender = "noreply@example.com"
			const magicLink = new MagicLink("https://example.com/login?token=abc123", 15)

			// Act
			const email = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink,
			})

			// Assert
			const body = email.getBody()
			expect(body).toContain("<html>")
			expect(body).toContain("<body>")
			expect(body).toContain("</body>")
			expect(body).toContain("</html>")
		})

		it("should create an Email body with a clickable link", () => {
			// Arrange
			const recipient = "user@example.com"
			const sender = "noreply@example.com"
			const loginLink = "https://example.com/login?token=abc123"
			const magicLink = new MagicLink(loginLink, 15)

			// Act
			const email = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink,
			})

			// Assert
			const body = email.getBody()
			expect(body).toContain(`<a href="${loginLink}"`)
			expect(body).toContain('target="_blank"')
			expect(body).toContain("Click here to login")
		})

		it("should create an Email with different expiration times", () => {
			// Arrange
			const recipient = "user@example.com"
			const sender = "noreply@example.com"
			const magicLink1 = new MagicLink("https://example.com/login?token=abc123", 5)
			const magicLink2 = new MagicLink("https://example.com/login?token=abc123", 15)
			const magicLink3 = new MagicLink("https://example.com/login?token=abc123", 60)

			// Act
			const email1 = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink: magicLink1,
			})
			const email2 = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink: magicLink2,
			})
			const email3 = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink: magicLink3,
			})

			// Assert
			expect(email1.getBody()).toContain("5 mins")
			expect(email2.getBody()).toContain("15 mins")
			expect(email3.getBody()).toContain("60 mins")
		})

		it("should create an Email with different login links", () => {
			// Arrange
			const recipient = "user@example.com"
			const sender = "noreply@example.com"
			const loginLink1 = "https://example.com/login?token=abc123"
			const loginLink2 = "https://example.com/login?token=xyz789"
			const magicLink1 = new MagicLink(loginLink1, 15)
			const magicLink2 = new MagicLink(loginLink2, 15)

			// Act
			const email1 = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink: magicLink1,
			})
			const email2 = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink: magicLink2,
			})

			// Assert
			expect(email1.getBody()).toContain(loginLink1)
			expect(email2.getBody()).toContain(loginLink2)
			expect(email1.getBody()).not.toContain(loginLink2)
			expect(email2.getBody()).not.toContain(loginLink1)
		})

		it("should create an Email with trimmed body (no leading/trailing whitespace)", () => {
			// Arrange
			const recipient = "user@example.com"
			const sender = "noreply@example.com"
			const magicLink = new MagicLink("https://example.com/login?token=abc123", 15)

			// Act
			const email = MagicLinkEmailFactory.create({
				recipient,
				sender,
				magicLink,
			})

			// Assert
			const body = email.getBody()
			expect(body).not.toMatch(/^\s+/)
			expect(body).not.toMatch(/\s+$/)
		})

		it("should create different Email instances for different recipients", () => {
			// Arrange
			const recipient1 = "user1@example.com"
			const recipient2 = "user2@example.com"
			const sender = "noreply@example.com"
			const magicLink = new MagicLink("https://example.com/login?token=abc123", 15)

			// Act
			const email1 = MagicLinkEmailFactory.create({
				recipient: recipient1,
				sender,
				magicLink,
			})
			const email2 = MagicLinkEmailFactory.create({
				recipient: recipient2,
				sender,
				magicLink,
			})

			// Assert
			expect(email1.getRecipient()).toBe(recipient1)
			expect(email2.getRecipient()).toBe(recipient2)
			expect(email1.getRecipient()).not.toBe(email2.getRecipient())
		})

		it("should create different Email instances for different senders", () => {
			// Arrange
			const recipient = "user@example.com"
			const sender1 = "noreply@example.com"
			const sender2 = "support@example.com"
			const magicLink = new MagicLink("https://example.com/login?token=abc123", 15)

			// Act
			const email1 = MagicLinkEmailFactory.create({
				recipient,
				sender: sender1,
				magicLink,
			})
			const email2 = MagicLinkEmailFactory.create({
				recipient,
				sender: sender2,
				magicLink,
			})

			// Assert
			expect(email1.getSender()).toBe(sender1)
			expect(email2.getSender()).toBe(sender2)
			expect(email1.getSender()).not.toBe(email2.getSender())
		})
	})
})
