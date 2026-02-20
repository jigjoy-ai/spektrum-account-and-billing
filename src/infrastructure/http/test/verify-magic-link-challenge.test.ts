import { APIGatewayProxyEvent } from "aws-lambda"
import { describe, it, expect, beforeEach } from "@rstest/core"
import { VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"
import { createVerifyMagicLinkChallengeHandler } from "@infra/http/factories/verify-magic-link-challenge"
import { AuthSession } from "@domain/auth-session"
import { Organization } from "@domain/organization"

describe("Verify Magic Link Handler", () => {
	let handler: (event: APIGatewayProxyEvent) => Promise<any>

	beforeEach(() => {
		// Reset handler before each test
		handler = undefined as any
	})

	it("returns 200 and access token when magic link is verified successfully", async () => {
		const mockAccessToken = "mock-access-token-12345"
		const mockUserEmail = "user@example.com"
		const mockOwnerId = "owner-id-123"
		const mockOrganization = Organization.rehydrate("organization-id-123", mockOwnerId, 0, [])
		const mockAuthSession = AuthSession.create(mockAccessToken, mockUserEmail, mockOrganization, [])

		const mockUseCase: VerifyMagicLinkChallengeUseCase = {
			execute: async () => {
				return mockAuthSession
			},
		}

		handler = createVerifyMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: JSON.stringify({
				email: mockUserEmail,
				challenge: "test-challenge",
			}),
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(200)

		const body = JSON.parse(result.body)

		expect(body.authSession.accessToken).toBe(mockAccessToken)
		expect(body.authSession.userData).toBeDefined()
		expect(body.authSession.userData.organizationId).toBe("organization-id-123")
		expect(body.authSession.userData.email).toBe(mockUserEmail)
		expect(body.authSession.userData.credits).toBe(0)
		expect(body.authSession.userData.apiKeys).toEqual([])
	})

	it("returns 400 when body is missing", async () => {
		const mockUseCase: VerifyMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createVerifyMagicLinkChallengeHandler(mockUseCase)

		const event = {} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBe("No page body")
	})

	it("returns 400 when body is null", async () => {
		const mockUseCase: VerifyMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createVerifyMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: null,
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBe("No page body")
	})

	it("returns 400 when body is empty string", async () => {
		const mockUseCase: VerifyMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createVerifyMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: "",
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBe("No page body")
	})

	it("returns 400 when email is missing from body", async () => {
		const mockUseCase: VerifyMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createVerifyMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: JSON.stringify({
				challenge: "test-challenge",
			}),
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toContain("email")
	})

	it("returns 400 when challenge is missing from body", async () => {
		const mockUseCase: VerifyMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createVerifyMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: JSON.stringify({
				email: "user@example.com",
			}),
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toContain("challenge")
	})

	it("returns 400 when email is not a valid email format", async () => {
		const mockUseCase: VerifyMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createVerifyMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: JSON.stringify({
				email: "not-an-email",
				challenge: "test-challenge",
			}),
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBeDefined()
	})

	it("returns 400 when email is not a string", async () => {
		const mockUseCase: VerifyMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createVerifyMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: JSON.stringify({
				email: 123,
				challenge: "test-challenge",
			}),
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBeDefined()
	})

	it("returns 400 when challenge is not a string", async () => {
		const mockUseCase: VerifyMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createVerifyMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: JSON.stringify({
				email: "user@example.com",
				challenge: 123,
			}),
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBeDefined()
	})

	it("returns 400 when body is invalid JSON", async () => {
		const mockUseCase: VerifyMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createVerifyMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: "invalid json{",
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBe("Invalid JSON in request body")
	})

	it("returns 500 when use case throws an unexpected error", async () => {
		const mockUseCase: VerifyMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Unexpected error")
			},
		}

		handler = createVerifyMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: JSON.stringify({
				email: "user@example.com",
				challenge: "test-challenge",
			}),
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(500)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBe("Something went wrong")
	})

	it("calls use case with correct email and challenge from request body", async () => {
		let capturedEmail: string | undefined
		let capturedChallenge: string | undefined

		const mockOrganization = Organization.rehydrate("organization-id", "owner-id", 0, [])
		const mockAuthSession = AuthSession.create("mock-access-token", "test@example.com", mockOrganization, [])

		const mockUseCase: VerifyMagicLinkChallengeUseCase = {
			execute: async (email: string, challenge: string) => {
				capturedEmail = email
				capturedChallenge = challenge
				return mockAuthSession
			},
		}

		handler = createVerifyMagicLinkChallengeHandler(mockUseCase)

		const testEmail = "test@example.com"
		const testChallenge = "test-challenge-123"
		const event = {
			body: JSON.stringify({
				email: testEmail,
				challenge: testChallenge,
			}),
		} as unknown as APIGatewayProxyEvent

		await handler(event)

		expect(capturedEmail).toBe(testEmail)
		expect(capturedChallenge).toBe(testChallenge)
	})

	it("returns 200 for valid email addresses with different formats", async () => {
		const mockAccessToken = "mock-access-token"
		const mockUseCase: VerifyMagicLinkChallengeUseCase = {
			execute: async (email: string) => {
				const mockOrganization = Organization.rehydrate("organization-id", "owner-id", 0, [])
				return AuthSession.create(mockAccessToken, email, mockOrganization, [])
			},
		}

		handler = createVerifyMagicLinkChallengeHandler(mockUseCase)

		const validEmails = [
			"user@example.com",
			"user.name@example.com",
			"user+tag@example.co.uk",
			"user123@example-domain.com",
		]

		for (const email of validEmails) {
			const event = {
				body: JSON.stringify({
					email: email,
					challenge: "test-challenge",
				}),
			} as unknown as APIGatewayProxyEvent

			const result = await handler(event)

			expect(result.statusCode).toBe(200)

			const body = JSON.parse(result.body)
			expect(body.authSession.accessToken).toBe(mockAccessToken)
			expect(body.authSession.userData).toBeDefined()
			expect(body.authSession.userData.email).toBe(email)
		}
	})
})
