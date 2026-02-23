import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { createApiKeySchema } from "@infra/http/schemas/create-api-key"
import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-ai/serverless-core"
import { CreateApiKeyParams, CreateApiKeyResponse, CreateApiKeyUseCase } from "@app/ports/use-cases/create-api-key"
import { UserData } from "@jigjoy-ai/auth"
import { extractAuthData } from "@heksagon/http"
import { Auth } from "@heksagon/app"

export function createCreateApiKeyHandler(createApiKeyUseCase: CreateApiKeyUseCase) {
	return async function createCreateApiKeyHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
		try {
			if (!event.body) throw new ValidationError("No page body")

			const auth: Auth<UserData> = extractAuthData(event)

			let parsedBody
			try {
				parsedBody = JSON.parse(event.body)
			} catch (parseError) {
				throw new ValidationError("Invalid JSON in request body")
			}

			schemaValidator(createApiKeySchema, parsedBody)
			const params: CreateApiKeyParams = parsedBody


			const result: CreateApiKeyResponse = await createApiKeyUseCase.execute(auth, params)

			return Responses._201({
				id: result.apiKey.getId(),
				name: result.apiKey.getName(),
				displayKey: result.apiKey.getDisplayKey(),
				rawKey: result.rawKey,
			})
		} catch (error) {
			return errorHandler(error)
		}
	}
}
