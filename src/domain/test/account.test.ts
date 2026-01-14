import { describe, it, expect } from "@rstest/core"
import { Account } from "@domain/account"

describe("Account", () => {
	it("should return the email when getEmail is called", () => {
		// Arrange
		const email = "test@example.com"
		const account = Account.create(email)

		// Act
		const result = account.getEmail()

		// Assert
		expect(result).toBe(email)
	})

	describe("create", () => {
		it("should create a new Account instance", () => {
			// Arrange
			const email = "test@example.com"

			// Act
			const account = Account.create(email)

			// Assert
			expect(account).toBeInstanceOf(Account)
		})

		it("should create an Account with the provided email", () => {
			// Arrange
			const email = "user@example.com"

			// Act
			const account = Account.create(email)

			// Assert
			expect(account.getEmail()).toBe(email)
		})

		it("should create different Account instances with different emails", () => {
			// Arrange
			const email1 = "user1@example.com"
			const email2 = "user2@example.com"

			// Act
			const account1 = Account.create(email1)
			const account2 = Account.create(email2)

			// Assert
			expect(account1.getEmail()).toBe(email1)
			expect(account2.getEmail()).toBe(email2)
			expect(account1.getEmail()).not.toBe(account2.getEmail())
		})

		it("should create an Account that is ready to use", () => {
			// Arrange
			const email = "ready@example.com"

			// Act
			const account = Account.create(email)

			// Assert
			expect(account.getEmail()).toBe(email)
			expect(typeof account.getEmail()).toBe("string")
		})
	})

	describe("rehydrate", () => {
		it("should rehydrate an Account with the provided email", () => {
			// Arrange
			const email = "rehydrated@example.com"

			// Act
			const rehydrated = Account.rehydrate(email)

			// Assert
			expect(rehydrated).toBeInstanceOf(Account)
			expect(rehydrated.getEmail()).toBe(email)
		})

		it("should rehydrate an Account that behaves the same as a created Account", () => {
			// Arrange
			const email = "same@example.com"

			// Act
			const created = Account.create(email)
			const rehydrated = Account.rehydrate(email)

			// Assert
			expect(created.getEmail()).toBe(rehydrated.getEmail())
			expect(created.getEmail()).toBe(email)
			expect(rehydrated.getEmail()).toBe(email)
		})

		it("should rehydrate multiple Accounts with the same email", () => {
			// Arrange
			const email = "duplicate@example.com"

			// Act
			const rehydrated1 = Account.rehydrate(email)
			const rehydrated2 = Account.rehydrate(email)

			// Assert
			expect(rehydrated1.getEmail()).toBe(email)
			expect(rehydrated2.getEmail()).toBe(email)
			expect(rehydrated1.getEmail()).toBe(rehydrated2.getEmail())
		})
	})
})
