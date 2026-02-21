import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { createApiKeySchema } from "@infra/http/schemas/create-api-key"
import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-ai/serverless-core"
import { CreateApiKeyUseCase } from "@app/ports/use-cases/create-api-key"

export function createCreateApiKeyHandler(createApiKeyUseCase: CreateApiKeyUseCase) {
	return async function createCreateApiKeyHandler({ body }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
		try {
			if (!body) throw new ValidationError("No page body")

			let parsedBody
			try {
				parsedBody = JSON.parse(body)
			} catch (parseError) {
				throw new ValidationError("Invalid JSON in request body")
			}

			schemaValidator(createApiKeySchema, parsedBody)

			const userId = parsedBody.userId
			const organizationId = parsedBody.organizationId
			const name = parsedBody.name

			const { apiKey, rawKey } = await createApiKeyUseCase.execute(organizationId, userId, name)

			return Responses._201({
				id: apiKey.getId(),
				name: apiKey.getName(),
				displayKey: apiKey.getDisplayKey(),
				rawKey: rawKey,
			})
		} catch (error) {
			return errorHandler(error)
		}
	}
}
