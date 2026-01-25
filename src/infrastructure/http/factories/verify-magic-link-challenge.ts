import { VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"
import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-io/serverless-core"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { verifyMagicLinkChallengeSchema } from "../schemas/verify-magic-link-challenge"

export function createVerifyMagicLinkChallengeHandler(verifyMagicLinkChallengeUseCase: VerifyMagicLinkChallengeUseCase) {
	return async function createVerifyMagicLinkChallengeHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
		try {
			if (!event.body) throw new ValidationError("No page body")

			let parsedBody
			try {
				parsedBody = JSON.parse(event.body)
			} catch (parseError) {
				throw new ValidationError("Invalid JSON in request body")
			}

			schemaValidator(verifyMagicLinkChallengeSchema, parsedBody)

			const email = parsedBody.email
			// Decode the challenge token in case it's URL-encoded (from the magic link URL)
			let challenge = parsedBody.challenge
			try {
				// Try to decode - if it's already decoded, decodeURIComponent will return the same value
				challenge = decodeURIComponent(challenge)
			} catch (e) {
				// If decoding fails, use the original value
				console.log("Challenge token URL decode failed, using original value")
			}

			console.log("verify-magic-link-challenge handler - Email:", email)
			console.log("verify-magic-link-challenge handler - Challenge length:", challenge?.length)
			console.log("verify-magic-link-challenge handler - Challenge first 20 chars:", challenge?.substring(0, 20))

			const accessToken = await verifyMagicLinkChallengeUseCase.execute(email, challenge)
			return Responses._200({ accessToken: accessToken })
		} catch (error) {
			return errorHandler(error)
		}
	}
}