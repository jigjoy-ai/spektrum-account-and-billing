import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { createApiKeySchema } from "@infra/http/schemas/create-api-key"
import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-io/serverless-core"
import { CreateApiKeyUseCase } from "@app/ports/use-cases/create-api-key"

export function createCreateApiKeyHandler(createApiKeyUseCase: CreateApiKeyUseCase) {
	return async function createCreateApiKeyHandler({
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

			schemaValidator(createApiKeySchema, parsedBody)

			const accountId = parsedBody.accountId
			const name = parsedBody.name

			const apiKey = await createApiKeyUseCase.execute(accountId, name)
			return Responses._201({ apiKey })
		} catch (error) {
			return errorHandler(error)
		}
	}
}
