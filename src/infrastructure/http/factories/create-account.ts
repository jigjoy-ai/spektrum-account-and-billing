import { CreateAccountUseCase } from "@app/ports/use-cases/create-account"
import { errorHandler, schemaValidator, ValidationError } from "@jigjoy-io/serverless-core"
import { createAccountSchema } from "@infra/http/schemas/create-account"
import { APIGatewayProxyEvent } from "aws-lambda"

export function createCreateAccountHandler(createAccountUseCase: CreateAccountUseCase) {
	return async function createCreateAccountHandler(event: APIGatewayProxyEvent) {
		try {
			if (!event.body) throw new ValidationError("No page body")

			let parsedBody
			try {
				parsedBody = JSON.parse(event.body)
			} catch (parseError) {
				throw new ValidationError("Invalid JSON in request body")
			}

			schemaValidator(createAccountSchema, parsedBody)

			const email = parsedBody.email

			const account = await createAccountUseCase.execute(email)

			return {
				statusCode: 200,
				body: JSON.stringify(account),
			}
		} catch (error) {
			return errorHandler(error)
		}
	}
}
