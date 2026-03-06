import { VerifyMagicLinkChallengeParams, VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"
import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-ai/serverless-core"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { verifyMagicLinkChallengeSchema } from "../schemas/verify-magic-link-challenge"
import { AuthSession } from "@domain/auth-session"
import { AuthSessionMapper } from "../mappers/auth-session-mapper"
import { AuthSessionDTO } from "../dtos/auth-session"

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

			const params: VerifyMagicLinkChallengeParams = {
				email: parsedBody.email,
				challenge: parsedBody.challenge
			}

			const authSession: AuthSession = await verifyMagicLinkChallengeUseCase.execute(params)
			const authSessionDTO: AuthSessionDTO = AuthSessionMapper.toDTO(authSession)

			return Responses._200(authSessionDTO)
		} catch (error) {
			return errorHandler(error)
		}
	}
}
