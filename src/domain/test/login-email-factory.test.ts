import { describe, it, expect } from "@rstest/core"
import { LoginEmailFactory } from "@domain/login-email-factory"
import { Email } from "@domain/email"

describe("LoginEmailFactory", () => {
	it("should create an Email with correct recipient and sender", () => {
		// Arrange
		const params = {
			recipient: "user@example.com",
			sender: "noreply@jigjoy.com",
			loginLink: "https://app.jigjoy.com/login?token=abc123",
			expirationInMinutes: 15,
		}

		// Act
		const email = LoginEmailFactory.create(params)

		// Assert
		expect(email).toBeInstanceOf(Email)
		expect(email.getRecipient()).toBe(params.recipient)
		expect(email.getSender()).toBe(params.sender)
	})

	it("should create an Email with correct subject", () => {
		// Arrange
		const params = {
			recipient: "user@example.com",
			sender: "noreply@jigjoy.com",
			loginLink: "https://app.jigjoy.com/login?token=abc123",
			expirationInMinutes: 15,
		}

		// Act
		const email = LoginEmailFactory.create(params)

		// Assert
		expect(email.getSubject()).toBe("JigJoy Login Link")
	})

	it("should create an Email body with the login link", () => {
		// Arrange
		const loginLink = "https://app.jigjoy.com/login?token=xyz789"
		const params = {
			recipient: "user@example.com",
			sender: "noreply@jigjoy.com",
			loginLink,
			expirationInMinutes: 15,
		}

		// Act
		const email = LoginEmailFactory.create(params)

		// Assert
		const body = email.getBody()
		expect(body).toContain(loginLink)
		expect(body).toContain(`href="${loginLink}"`)
		expect(body).toContain("Click here to login")
	})

	it("should include expiration time in the email body", () => {
		// Arrange
		const expirationInMinutes = 30
		const params = {
			recipient: "user@example.com",
			sender: "noreply@jigjoy.com",
			loginLink: "https://app.jigjoy.com/login?token=abc123",
			expirationInMinutes,
		}

		// Act
		const email = LoginEmailFactory.create(params)

		// Assert
		const body = email.getBody()
		expect(body).toContain(`expire in ${expirationInMinutes} mins`)
	})

	it("should create HTML formatted email body", () => {
		// Arrange
		const params = {
			recipient: "user@example.com",
			sender: "noreply@jigjoy.com",
			loginLink: "https://app.jigjoy.com/login?token=abc123",
			expirationInMinutes: 15,
		}

		// Act
		const email = LoginEmailFactory.create(params)

		// Assert
		const body = email.getBody()
		expect(body).toContain("<html>")
		expect(body).toContain("<body>")
		expect(body).toContain("</body>")
		expect(body).toContain("</html>")
		expect(body).toContain("<a href")
		expect(body).toContain('target="_blank"')
	})

	it("should handle different expiration times correctly", () => {
		// Arrange
		const expirationTimes = [5, 10, 15, 30, 60]

		expirationTimes.forEach((expirationInMinutes) => {
			const params = {
				recipient: "user@example.com",
				sender: "noreply@jigjoy.com",
				loginLink: "https://app.jigjoy.com/login?token=abc123",
				expirationInMinutes,
			}

			// Act
			const email = LoginEmailFactory.create(params)

			// Assert
			const body = email.getBody()
			expect(body).toContain(`expire in ${expirationInMinutes} mins`)
		})
	})

	it("should handle different login link formats", () => {
		// Arrange
		const loginLinks = [
			"https://app.jigjoy.com/login?token=abc123",
			"http://localhost:3000/auth?code=xyz",
			"https://example.com/verify?token=long-token-string-12345",
		]

		loginLinks.forEach((loginLink) => {
			const params = {
				recipient: "user@example.com",
				sender: "noreply@jigjoy.com",
				loginLink,
				expirationInMinutes: 15,
			}

			// Act
			const email = LoginEmailFactory.create(params)

			// Assert
			const body = email.getBody()
			expect(body).toContain(loginLink)
			expect(body).toContain(`href="${loginLink}"`)
		})
	})

	it("should trim whitespace from the email body", () => {
		// Arrange
		const params = {
			recipient: "user@example.com",
			sender: "noreply@jigjoy.com",
			loginLink: "https://app.jigjoy.com/login?token=abc123",
			expirationInMinutes: 15,
		}

		// Act
		const email = LoginEmailFactory.create(params)

		// Assert
		const body = email.getBody()
		expect(body).not.toMatch(/^\s+/)
		expect(body).not.toMatch(/\s+$/)
	})

	it("should create different Email instances for different recipients", () => {
		// Arrange
		const params1 = {
			recipient: "user1@example.com",
			sender: "noreply@jigjoy.com",
			loginLink: "https://app.jigjoy.com/login?token=abc123",
			expirationInMinutes: 15,
		}

		const params2 = {
			recipient: "user2@example.com",
			sender: "noreply@jigjoy.com",
			loginLink: "https://app.jigjoy.com/login?token=xyz789",
			expirationInMinutes: 30,
		}

		// Act
		const email1 = LoginEmailFactory.create(params1)
		const email2 = LoginEmailFactory.create(params2)

		// Assert
		expect(email1.getRecipient()).toBe(params1.recipient)
		expect(email2.getRecipient()).toBe(params2.recipient)
		expect(email1.getRecipient()).not.toBe(email2.getRecipient())
		expect(email1.getBody()).not.toBe(email2.getBody())
	})

	it("should include all required elements in the email body", () => {
		// Arrange
		const params = {
			recipient: "user@example.com",
			sender: "noreply@jigjoy.com",
			loginLink: "https://app.jigjoy.com/login?token=abc123",
			expirationInMinutes: 15,
		}

		// Act
		const email = LoginEmailFactory.create(params)

		// Assert
		const body = email.getBody()
		expect(body).toContain("one-time sign in link")
		expect(body).toContain("expire in")
		expect(body).toContain("mins")
		expect(body).toContain("Click here to login")
		expect(body).toContain(params.loginLink)
	})
})
