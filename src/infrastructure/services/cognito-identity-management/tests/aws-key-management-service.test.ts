import { describe, it, expect, beforeEach } from "@rstest/core"
import { AWSKeyManagementService } from "@infra/services/cognito-identity-management/util/aws-key-management-service"

describe("AWS Key Management Service Integration Tests", () => {
	let keyManagementService: AWSKeyManagementService
	const kmsKeyId = process.env.KMS_KEY_ID as string

	beforeEach(() => {
		if (!kmsKeyId) {
			throw new Error("KMS_KEY_ID environment variable is required for integration tests")
		}
		keyManagementService = new AWSKeyManagementService(kmsKeyId)
	})

	it("should encrypt a plain text string", async () => {
		const plaintext = "test-encrypt-string"

		const ciphertext = await keyManagementService.encrypt(plaintext)

		expect(ciphertext).toBeDefined()
		expect(ciphertext).toBeInstanceOf(Uint8Array)
		expect(ciphertext.length).toBeGreaterThan(0)
	})

	it("should decrypt an encrypted string and return original value", async () => {
		const plaintext = "test-roundtrip-string"
		const ciphertext = await keyManagementService.encrypt(plaintext)

		// Convert Uint8Array to base64 string for decrypt method
		const base64Ciphertext = Buffer.from(ciphertext).toString("base64")
		const decrypted = await keyManagementService.decrypt(base64Ciphertext)

		expect(decrypted).toBe(plaintext)
	})

	it("should encrypt and decrypt JSON data", async () => {
		const jsonData = { email: "test@example.com", expiration: "2024-12-31T23:59:59Z" }
		const plaintext = JSON.stringify(jsonData)

		const ciphertext = await keyManagementService.encrypt(plaintext)
		const base64Ciphertext = Buffer.from(ciphertext).toString("base64")
		const decrypted = await keyManagementService.decrypt(base64Ciphertext)

		expect(decrypted).toBe(plaintext)
		const parsed = JSON.parse(decrypted)
		expect(parsed.email).toBe(jsonData.email)
		expect(parsed.expiration).toBe(jsonData.expiration)
	})

	it("should throw an error when encrypting empty string", async () => {
		const plaintext = ""
		// AWS KMS doesn't allow encrypting empty strings
		await expect(keyManagementService.encrypt(plaintext)).rejects.toThrow()
	})

	it("should encrypt and decrypt long text", async () => {
		const plaintext = "a".repeat(1000)
		const ciphertext = await keyManagementService.encrypt(plaintext)
		const base64Ciphertext = Buffer.from(ciphertext).toString("base64")
		const decrypted = await keyManagementService.decrypt(base64Ciphertext)

		expect(decrypted).toBe(plaintext)
		expect(decrypted.length).toBe(1000)
	})

	it("should encrypt and decrypt special characters", async () => {
		const plaintext = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~"
		const ciphertext = await keyManagementService.encrypt(plaintext)
		const base64Ciphertext = Buffer.from(ciphertext).toString("base64")
		const decrypted = await keyManagementService.decrypt(base64Ciphertext)

		expect(decrypted).toBe(plaintext)
	})

	it("should encrypt and decrypt unicode characters", async () => {
		const plaintext = "Hello 世界 🌍"
		const ciphertext = await keyManagementService.encrypt(plaintext)
		const base64Ciphertext = Buffer.from(ciphertext).toString("base64")
		const decrypted = await keyManagementService.decrypt(base64Ciphertext)

		expect(decrypted).toBe(plaintext)
	})

	it("should produce different ciphertext for same plaintext on multiple encrypts", async () => {
		const plaintext = "test-deterministic"
		const ciphertext1 = await keyManagementService.encrypt(plaintext)
		const ciphertext2 = await keyManagementService.encrypt(plaintext)

		// KMS uses encryption context and random IV, so same plaintext produces different ciphertext
		expect(ciphertext1).not.toEqual(ciphertext2)

		// But both should decrypt to the same plaintext
		const base64Ciphertext1 = Buffer.from(ciphertext1).toString("base64")
		const base64Ciphertext2 = Buffer.from(ciphertext2).toString("base64")
		const decrypted1 = await keyManagementService.decrypt(base64Ciphertext1)
		const decrypted2 = await keyManagementService.decrypt(base64Ciphertext2)

		expect(decrypted1).toBe(plaintext)
		expect(decrypted2).toBe(plaintext)
	})

	it("should throw an error when decrypting with invalid ciphertext", async () => {
		const invalidCiphertext = "invalid-base64-ciphertext"

		await expect(keyManagementService.decrypt(invalidCiphertext)).rejects.toThrow()
	})

	it("should throw an error when decrypting with empty string", async () => {
		await expect(keyManagementService.decrypt("")).rejects.toThrow()
	})

	it("should throw an error when using invalid KMS key ID", async () => {
		const invalidService = new AWSKeyManagementService("invalid-key-id")
		const plaintext = "test-invalid-key"

		await expect(invalidService.encrypt(plaintext)).rejects.toThrow()
	})
})
