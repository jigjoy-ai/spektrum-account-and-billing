import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { createApiKeySchema } from "@infra/http/schemas/create-api-key"
import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-ai/serverless-core"
import { CreateApiKeyUseCase } from "@app/ports/use-cases/create-api-key"

export function createCreateApiKeyHandler(createApiKeyUseCase: CreateApiKeyUseCase) {
	return async function createCreateApiKeyHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
		try {
			if (!event.body) throw new ValidationError("No page body")

			let parsedBody
			try {
				parsedBody = JSON.parse(event.body)
			} catch (parseError) {
				throw new ValidationError("Invalid JSON in request body")
			}

			schemaValidator(createApiKeySchema, parsedBody)

			const userId = event.headers?.["x-user-id"] || event.headers?.["X-User-Id"]

			if (!userId) throw new ValidationError("Missing header: x-user-id or X-User-Id")

			const organizationId = event.headers?.["x-organization-id"] || event.headers?.["X-Organization-Id"]
			if (!organizationId) throw new ValidationError("Missing header: x-organization-id or X-Organization-Id")

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
