import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-ai/serverless-core"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { ChargeUseCase } from "@app/ports/use-cases/charge"
import { chargeSchema } from "../schemas/charge"

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

			const { accountId, amount } = parsedBody

			await chargeUseCase.execute(accountId, amount)

			return Responses._200({
				message: "Credits charged successfully",
			})
		} catch (error) {
			return errorHandler(error)
		}
	}
}
