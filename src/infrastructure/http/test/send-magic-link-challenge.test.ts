import { APIGatewayProxyEvent } from "aws-lambda"
import { describe, it, expect, beforeEach } from "@rstest/core"
import { SendMagicLinkChallengeUseCase } from "@app/ports/use-cases/send-magic-link-challenge"
import { createSendMagicLinkChallengeHandler } from "@infra/http/factories/send-magic-link-challenge"

describe("Send Magic Link Handler", () => {
	let handler: (event: APIGatewayProxyEvent) => Promise<any>

	beforeEach(() => {
		// Reset handler before each test
		handler = undefined as any
	})

	it("returns 202 and success message when magic link is sent successfully", async () => {
		const mockUseCase: SendMagicLinkChallengeUseCase = {
			execute: async () => {
				// Success - no error thrown
			},
		}

		handler = createSendMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: JSON.stringify({
				email: "user@example.com",
			}),
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(202)

		const body = JSON.parse(result.body)

		expect(body.message).toBe("Magic link challenge sent successfully")
	})

	it("returns 400 when body is missing", async () => {
		const mockUseCase: SendMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createSendMagicLinkChallengeHandler(mockUseCase)

		const event = {} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBe("No page body")
	})

	it("returns 400 when body is null", async () => {
		const mockUseCase: SendMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createSendMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: null,
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBe("No page body")
	})

	it("returns 400 when body is empty string", async () => {
		const mockUseCase: SendMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createSendMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: "",
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBe("No page body")
	})

	it("returns 400 when email is missing from body", async () => {
		const mockUseCase: SendMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createSendMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: JSON.stringify({}),
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toContain("email")
	})

	it("returns 400 when email is not a valid email format", async () => {
		const mockUseCase: SendMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createSendMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: JSON.stringify({
				email: "not-an-email",
			}),
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBeDefined()
	})

	it("returns 400 when email is not a string", async () => {
		const mockUseCase: SendMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createSendMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: JSON.stringify({
				email: 123,
			}),
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBeDefined()
	})

	it("returns 400 when body is invalid JSON", async () => {
		const mockUseCase: SendMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Should not be called")
			},
		}

		handler = createSendMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: "invalid json{",
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(400)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBe("Invalid JSON in request body")
	})

	it("returns 500 when use case throws an unexpected error", async () => {
		const mockUseCase: SendMagicLinkChallengeUseCase = {
			execute: async () => {
				throw new Error("Unexpected error")
			},
		}

		handler = createSendMagicLinkChallengeHandler(mockUseCase)

		const event = {
			body: JSON.stringify({
				email: "user@example.com",
			}),
		} as unknown as APIGatewayProxyEvent

		const result = await handler(event)

		expect(result.statusCode).toBe(500)

		const body = JSON.parse(result.body)

		expect(body.errorMessage).toBe("Something went wrong")
	})

	it("calls use case with correct email from request body", async () => {
		let capturedEmail: string | undefined

		const mockUseCase: SendMagicLinkChallengeUseCase = {
			execute: async (email: string) => {
				capturedEmail = email
			},
		}

		handler = createSendMagicLinkChallengeHandler(mockUseCase)

		const testEmail = "test@example.com"
		const event = {
			body: JSON.stringify({
				email: testEmail,
			}),
		} as unknown as APIGatewayProxyEvent

		await handler(event)

		expect(capturedEmail).toBe(testEmail)
	})

	it("returns 202 for valid email addresses with different formats", async () => {
		const mockUseCase: SendMagicLinkChallengeUseCase = {
			execute: async () => {
				// Success
			},
		}

		handler = createSendMagicLinkChallengeHandler(mockUseCase)

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
				}),
			} as unknown as APIGatewayProxyEvent

			const result = await handler(event)

			expect(result.statusCode).toBe(202)

			const body = JSON.parse(result.body)
			expect(body.message).toBe("Magic link challenge sent successfully")
		}
	})
})
