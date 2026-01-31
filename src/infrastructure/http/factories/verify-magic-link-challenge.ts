import { VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"
import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-io/serverless-core"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { verifyMagicLinkChallengeSchema } from "../schemas/verify-magic-link-challenge"
import { AuthSession } from "@domain/auth-session"

export function createVerifyMagicLinkChallengeHandler(
	verifyMagicLinkChallengeUseCase: VerifyMagicLinkChallengeUseCase,
) {
	return async function createVerifyMagicLinkChallengeHandler(
		event: APIGatewayProxyEvent,
	): Promise<APIGatewayProxyResult> {
		try {
			if (!event.body) throw new ValidationError("No page body")

			let parsedBody
			try {
				parsedBody = JSON.parse(event.body)
			} catch (parseError) {
				throw new ValidationError("Invalid JSON in request body")
			}

			schemaValidator(verifyMagicLinkChallengeSchema, parsedBody)

			const { email, challenge } = parsedBody

			console.log("verify-magic-link-challenge handler - Email:", email)

			const authSession: AuthSession = await verifyMagicLinkChallengeUseCase.execute(email, challenge)
			return Responses._200({
				accessToken: authSession.getAccessToken(),
				userData: {
					id: authSession.getUserData().getId(),
					email: authSession.getUserData().getEmail(),
				},
			})
		} catch (error) {
			return errorHandler(error)
		}
	}
}
