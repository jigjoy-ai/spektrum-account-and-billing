import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-ai/serverless-core"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { ChargeParams, ChargeUseCase } from "@app/ports/use-cases/charge"
import { chargeSchema } from "../schemas/charge"
import { Auth } from "@heksagon/app"
import { UserData } from "@jigjoy-ai/auth"
import { extractAuthData } from "@heksagon/http"

export function createChargeHandler(chargeUseCase: ChargeUseCase) {
	return async function createChargeHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
		try {
			if (!event.body) throw new ValidationError("No page body")

			let parsedBody
			try {
				parsedBody = JSON.parse(event.body)
			} catch (parseError) {
				throw new ValidationError("Invalid JSON in request body")
			}

			schemaValidator(chargeSchema, parsedBody)

			const params: ChargeParams = parsedBody


			const auth: Auth<UserData> = extractAuthData(event.headers)

			const totalCostUsd = await chargeUseCase.execute(auth, params)

			return Responses._200({ totalCostUsd })
		} catch (error) {
			return errorHandler(error)
		}
	}
}
