import { describe, it, expect, beforeEach } from "@rstest/core"
import { KMSTokenService } from "@infra/services/token-service"

describe("KMS Token Service", () => {
	let tokenService: KMSTokenService

	const kmsKeyId = process.env.KMS_KEY_ID
	if (!kmsKeyId) {
		throw new Error("KMS_KEY_ID environment variable is required for integration tests")
	}

	beforeEach(() => {
		tokenService = new KMSTokenService(kmsKeyId)
	})

	it("should generate a token successfully", async () => {
		const email = "user@example.com"
		const expirationInMinutes = 5

		const token = await tokenService.generateToken(email, expirationInMinutes)

		expect(token).toBeDefined()
		expect(typeof token).toBe("string")
		expect(token.length).toBeGreaterThan(0)
	})

	it("should generate different tokens for different emails", async () => {
		const email1 = "user1@example.com"
		const email2 = "user2@example.com"
		const expirationInMinutes = 5

		const token1 = await tokenService.generateToken(email1, expirationInMinutes)
		const token2 = await tokenService.generateToken(email2, expirationInMinutes)

		expect(token1).not.toBe(token2)
	})

	it("should generate different tokens for the same email at different times", async () => {
		const email = "user@example.com"
		const expirationInMinutes = 5

		const token1 = await tokenService.generateToken(email, expirationInMinutes)
		// Wait a small amount to ensure different timestamp
		await new Promise((resolve) => setTimeout(resolve, 10))
		const token2 = await tokenService.generateToken(email, expirationInMinutes)

		expect(token1).not.toBe(token2)
	})

	it("should verify a valid token successfully", async () => {
		const email = "user@example.com"
		const expirationInMinutes = 5

		const token = await tokenService.generateToken(email, expirationInMinutes)
		const isValid = await tokenService.verifyToken(email, token)

		expect(isValid).toBe(true)
	})

	it("should return false when verifying token with wrong email", async () => {
		const email1 = "user1@example.com"
		const email2 = "user2@example.com"
		const expirationInMinutes = 5

		const token = await tokenService.generateToken(email1, expirationInMinutes)
		const isValid = await tokenService.verifyToken(email2, token)

		expect(isValid).toBe(false)
	})

	it("should return false when verifying an expired token", async () => {
		const email = "user@example.com"
		const expirationInMinutes = 0.001 // Very short expiration (0.06 seconds)

		const token = await tokenService.generateToken(email, expirationInMinutes)

		// Wait for token to expire
		await new Promise((resolve) => setTimeout(resolve, 100))

		const isValid = await tokenService.verifyToken(email, token)

		expect(isValid).toBe(false)
	})

	it("should return false when verifying an invalid token", async () => {
		const email = "user@example.com"
		const invalidToken = "invalid-token-string"

		// KMS throws an error when trying to decrypt invalid ciphertext
		// The verifyToken method should catch this and return false
		const isValid = await tokenService.verifyToken(email, invalidToken)

		expect(isValid).toBe(false)
	})

	it("should return false when verifying an empty token", async () => {
		const email = "user@example.com"
		const emptyToken = ""

		// KMS throws a validation error for empty ciphertext
		// The verifyToken method should catch this and return false
		const isValid = await tokenService.verifyToken(email, emptyToken)

		expect(isValid).toBe(false)
	})

	it("should convert token to URL-safe format", () => {
		const token = "test+token/with=special&chars"
		const urlSafeToken = tokenService.toUrlSafeToken(token)

		expect(urlSafeToken).toBeDefined()
		expect(typeof urlSafeToken).toBe("string")
		// URL-safe tokens should not contain certain special characters
		expect(urlSafeToken).not.toContain("+")
		expect(urlSafeToken).not.toContain("/")
		expect(urlSafeToken).not.toContain("=")
	})

	it("should generate and verify token with different expiration times", async () => {
		const email = "user@example.com"
		const expirationTimes = [1, 5, 10, 30, 60]

		for (const expirationInMinutes of expirationTimes) {
			const token = await tokenService.generateToken(email, expirationInMinutes)
			const isValid = await tokenService.verifyToken(email, token)

			expect(isValid).toBe(true)
		}
	})

	it("should handle token generation and verification round trip", async () => {
		const email = "user@example.com"
		const expirationInMinutes = 5

		// Generate token
		const token = await tokenService.generateToken(email, expirationInMinutes)

		// Convert to URL-safe
		const urlSafeToken = tokenService.toUrlSafeToken(token)

		// Verify original token (not URL-safe version)
		const isValid = await tokenService.verifyToken(email, token)

		expect(isValid).toBe(true)
		expect(urlSafeToken).not.toBe(token)
	})

	it("should throw an error when KMS key ID is invalid", async () => {
		const invalidTokenService = new KMSTokenService("invalid-key-id")
		const email = "user@example.com"
		const expirationInMinutes = 5

		await expect(invalidTokenService.generateToken(email, expirationInMinutes)).rejects.toThrow()
	})

	it("should return false when verifying a tampered token", async () => {
		const email = "user@example.com"
		const validTokenService = new KMSTokenService(kmsKeyId)

		// Generate a valid token first
		const token = await validTokenService.generateToken(email, 5)

		// Create a token that's been tampered with (invalid ciphertext)
		// This simulates corrupted data or a token encrypted with a different key
		const tamperedToken = token.slice(0, -10) + "XXXXXXXXXX"

		// Try to verify with tampered token - should return false (not throw)
		// because verifyToken catches decrypt errors
		const isValid = await validTokenService.verifyToken(email, tamperedToken)
		expect(isValid).toBe(false)
	})

	it("should generate tokens that are base64 encoded", async () => {
		const email = "user@example.com"
		const expirationInMinutes = 5

		const token = await tokenService.generateToken(email, expirationInMinutes)

		// Base64 strings should only contain A-Z, a-z, 0-9, +, /, and = characters
		const base64Pattern = /^[A-Za-z0-9+/=]+$/
		expect(token).toMatch(base64Pattern)
	})

	it("should handle concurrent token generation", async () => {
		const email = "user@example.com"
		const expirationInMinutes = 5

		const promises = Array.from({ length: 5 }, () =>
			tokenService.generateToken(email, expirationInMinutes),
		)

		const tokens = await Promise.all(promises)

		// All tokens should be different
		const uniqueTokens = new Set(tokens)
		expect(uniqueTokens.size).toBe(5)

		// All tokens should be valid
		for (const token of tokens) {
			const isValid = await tokenService.verifyToken(email, token)
			expect(isValid).toBe(true)
		}
	})
})
