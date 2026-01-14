import { describe, it, expect } from "@rstest/core"
import { MagicLink } from "@domain/magic-link"

describe("MagicLink", () => {
	it("should return the login link when getLoginLink is called", () => {
		// Arrange
		const loginLink = "https://example.com/login?token=abc123"
		const expiration = 15
		const magicLink = new MagicLink(loginLink, expiration)

		// Act
		const result = magicLink.getLoginLink()

		// Assert
		expect(result).toBe(loginLink)
	})

	it("should return the expiration when getExpiration is called", () => {
		// Arrange
		const loginLink = "https://example.com/login?token=abc123"
		const expiration = 15
		const magicLink = new MagicLink(loginLink, expiration)

		// Act
		const result = magicLink.getExpiration()

		// Assert
		expect(result).toBe(expiration)
	})

	it("should create a MagicLink with all provided properties", () => {
		// Arrange
		const loginLink = "https://example.com/login?token=xyz789"
		const expiration = 30

		// Act
		const magicLink = new MagicLink(loginLink, expiration)

		// Assert
		expect(magicLink.getLoginLink()).toBe(loginLink)
		expect(magicLink.getExpiration()).toBe(expiration)
	})

	it("should create different MagicLink instances with different properties", () => {
		// Arrange
		const loginLink1 = "https://example.com/login?token=abc123"
		const expiration1 = 15

		const loginLink2 = "https://example.com/login?token=def456"
		const expiration2 = 60

		// Act
		const magicLink1 = new MagicLink(loginLink1, expiration1)
		const magicLink2 = new MagicLink(loginLink2, expiration2)

		// Assert
		expect(magicLink1.getLoginLink()).toBe(loginLink1)
		expect(magicLink2.getLoginLink()).toBe(loginLink2)
		expect(magicLink1.getLoginLink()).not.toBe(magicLink2.getLoginLink())

		expect(magicLink1.getExpiration()).toBe(expiration1)
		expect(magicLink2.getExpiration()).toBe(expiration2)
		expect(magicLink1.getExpiration()).not.toBe(magicLink2.getExpiration())
	})

	it("should handle different expiration values", () => {
		// Arrange
		const loginLink = "https://example.com/login?token=test"
		const expiration1 = 5
		const expiration2 = 15
		const expiration3 = 30
		const expiration4 = 60

		// Act
		const magicLink1 = new MagicLink(loginLink, expiration1)
		const magicLink2 = new MagicLink(loginLink, expiration2)
		const magicLink3 = new MagicLink(loginLink, expiration3)
		const magicLink4 = new MagicLink(loginLink, expiration4)

		// Assert
		expect(magicLink1.getExpiration()).toBe(5)
		expect(magicLink2.getExpiration()).toBe(15)
		expect(magicLink3.getExpiration()).toBe(30)
		expect(magicLink4.getExpiration()).toBe(60)
	})

	it("should handle zero expiration", () => {
		// Arrange
		const loginLink = "https://example.com/login?token=expired"
		const expiration = 0

		// Act
		const magicLink = new MagicLink(loginLink, expiration)

		// Assert
		expect(magicLink.getExpiration()).toBe(0)
		expect(magicLink.getLoginLink()).toBe(loginLink)
	})

	it("should handle long login links", () => {
		// Arrange
		const loginLink =
			"https://example.com/login?token=very-long-token-1234567890abcdefghijklmnopqrstuvwxyz&redirect=https://app.example.com/dashboard"
		const expiration = 15

		// Act
		const magicLink = new MagicLink(loginLink, expiration)

		// Assert
		expect(magicLink.getLoginLink()).toBe(loginLink)
		expect(magicLink.getLoginLink().length).toBeGreaterThan(100)
	})

	it("should handle URLs with query parameters", () => {
		// Arrange
		const loginLink = "https://example.com/login?token=abc&redirect=/dashboard&source=email"
		const expiration = 20

		// Act
		const magicLink = new MagicLink(loginLink, expiration)

		// Assert
		expect(magicLink.getLoginLink()).toBe(loginLink)
		expect(magicLink.getLoginLink()).toContain("token=abc")
		expect(magicLink.getLoginLink()).toContain("redirect=/dashboard")
		expect(magicLink.getLoginLink()).toContain("source=email")
	})
})
