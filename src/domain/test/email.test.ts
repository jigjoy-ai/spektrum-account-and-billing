import { describe, it, expect } from "@rstest/core"
import { Email } from "@domain/email"

describe("Email", () => {
	it("should return the recipient when getRecipient is called", () => {
		// Arrange
		const recipient = "recipient@example.com"
		const sender = "sender@example.com"
		const subject = "Test Subject"
		const body = "Test Body"
		const email = new Email(recipient, sender, subject, body)

		// Act
		const result = email.getRecipient()

		// Assert
		expect(result).toBe(recipient)
	})

	it("should return the sender when getSender is called", () => {
		// Arrange
		const recipient = "recipient@example.com"
		const sender = "sender@example.com"
		const subject = "Test Subject"
		const body = "Test Body"
		const email = new Email(recipient, sender, subject, body)

		// Act
		const result = email.getSender()

		// Assert
		expect(result).toBe(sender)
	})

	it("should return the subject when getSubject is called", () => {
		// Arrange
		const recipient = "recipient@example.com"
		const sender = "sender@example.com"
		const subject = "Test Subject"
		const body = "Test Body"
		const email = new Email(recipient, sender, subject, body)

		// Act
		const result = email.getSubject()

		// Assert
		expect(result).toBe(subject)
	})

	it("should return the body when getBody is called", () => {
		// Arrange
		const recipient = "recipient@example.com"
		const sender = "sender@example.com"
		const subject = "Test Subject"
		const body = "Test Body"
		const email = new Email(recipient, sender, subject, body)

		// Act
		const result = email.getBody()

		// Assert
		expect(result).toBe(body)
	})

	it("should create an Email with all provided properties", () => {
		// Arrange
		const recipient = "user@example.com"
		const sender = "noreply@example.com"
		const subject = "Welcome Email"
		const body = "<html><body>Welcome!</body></html>"

		// Act
		const email = new Email(recipient, sender, subject, body)

		// Assert
		expect(email.getRecipient()).toBe(recipient)
		expect(email.getSender()).toBe(sender)
		expect(email.getSubject()).toBe(subject)
		expect(email.getBody()).toBe(body)
	})

	it("should create different Email instances with different properties", () => {
		// Arrange
		const recipient1 = "user1@example.com"
		const sender1 = "sender1@example.com"
		const subject1 = "Subject 1"
		const body1 = "Body 1"

		const recipient2 = "user2@example.com"
		const sender2 = "sender2@example.com"
		const subject2 = "Subject 2"
		const body2 = "Body 2"

		// Act
		const email1 = new Email(recipient1, sender1, subject1, body1)
		const email2 = new Email(recipient2, sender2, subject2, body2)

		// Assert
		expect(email1.getRecipient()).toBe(recipient1)
		expect(email2.getRecipient()).toBe(recipient2)
		expect(email1.getRecipient()).not.toBe(email2.getRecipient())

		expect(email1.getSender()).toBe(sender1)
		expect(email2.getSender()).toBe(sender2)
		expect(email1.getSender()).not.toBe(email2.getSender())

		expect(email1.getSubject()).toBe(subject1)
		expect(email2.getSubject()).toBe(subject2)
		expect(email1.getSubject()).not.toBe(email2.getSubject())

		expect(email1.getBody()).toBe(body1)
		expect(email2.getBody()).toBe(body2)
		expect(email1.getBody()).not.toBe(email2.getBody())
	})

	it("should handle empty strings for all properties", () => {
		// Arrange
		const recipient = ""
		const sender = ""
		const subject = ""
		const body = ""

		// Act
		const email = new Email(recipient, sender, subject, body)

		// Assert
		expect(email.getRecipient()).toBe("")
		expect(email.getSender()).toBe("")
		expect(email.getSubject()).toBe("")
		expect(email.getBody()).toBe("")
	})

	it("should handle HTML body content", () => {
		// Arrange
		const recipient = "user@example.com"
		const sender = "sender@example.com"
		const subject = "HTML Email"
		const body = `
			<html>
				<body>
					<h1>Hello</h1>
					<p>This is an HTML email.</p>
				</body>
			</html>
		`

		// Act
		const email = new Email(recipient, sender, subject, body)

		// Assert
		expect(email.getBody()).toBe(body)
		expect(email.getBody()).toContain("<html>")
		expect(email.getBody()).toContain("<body>")
		expect(email.getBody()).toContain("Hello")
	})

	it("should preserve whitespace and formatting in body", () => {
		// Arrange
		const recipient = "user@example.com"
		const sender = "sender@example.com"
		const subject = "Formatted Email"
		const body = "Line 1\nLine 2\n\tIndented Line"

		// Act
		const email = new Email(recipient, sender, subject, body)

		// Assert
		expect(email.getBody()).toBe(body)
		expect(email.getBody()).toContain("\n")
		expect(email.getBody()).toContain("\t")
	})
})
