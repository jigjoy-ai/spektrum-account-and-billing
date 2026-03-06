import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { sendMagicLinkChallengeSchema } from "../schemas/send-magic-link-challenge"
import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-ai/serverless-core"
import { SendMagicLinkChallengeParams, SendMagicLinkChallengeUseCase } from "@app/ports/use-cases/send-magic-link-challenge"

export function createSendMagicLinkChallengeHandler(sendMagicLinkChallengeUseCase: SendMagicLinkChallengeUseCase) {
	return async function createSendMagicLinkChallengeHandler({
		body,
	}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
		try {
			if (!body) throw new ValidationError("No page body")

			let parsedBody
			try {
				parsedBody = JSON.parse(body)
			} catch (parseError) {
				throw new ValidationError("Invalid JSON in request body")
			}

			schemaValidator(sendMagicLinkChallengeSchema, parsedBody)

			const params: SendMagicLinkChallengeParams = {
				email: parsedBody.email,
			}

			await sendMagicLinkChallengeUseCase.execute(params)
			return Responses._202({ message: "Magic link challenge sent successfully" })
		} catch (error) {
			return errorHandler(error)
		}
	}
}
