import { VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"
import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-io/serverless-core"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { verifyMagicLinkChallengeSchema } from "../schemas/verify-magic-link-challenge"

export function createVerifyMagicLinkChallengeHandler(verifyMagicLinkChallengeUseCase: VerifyMagicLinkChallengeUseCase) {
	return async function createVerifyMagicLinkChallengeHandler({ body }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
		try {
			if (!body) throw new ValidationError("No page body")

			let parsedBody
			try {
				parsedBody = JSON.parse(body)
			} catch (parseError) {
				throw new ValidationError("Invalid JSON in request body")
			}

			schemaValidator(verifyMagicLinkChallengeSchema, parsedBody)

			const email = parsedBody.email
			const challenge = parsedBody.challenge

			const accessToken = await verifyMagicLinkChallengeUseCase.execute(email, challenge)
			return Responses._200({ accessToken: accessToken })
		} catch (error) {
			return errorHandler(error)
		}
	}
}