import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-ai/serverless-core"
import { ProcessCreditsPurchaseParams, ProcessCreditsPurchaseUseCase } from "@app/ports/use-cases/process-credits-purchase"
import { processCreditsPurchaseSchema } from "../schemas/process-credits-purchase"

export function createProcessCreditsPurchaseHandler(processCreditsPurchase: ProcessCreditsPurchaseUseCase) {
	return async function createProcessCreditsPurchaseHandler({
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
            
			schemaValidator(processCreditsPurchaseSchema, parsedBody)

            const data = parsedBody.data
			const organizationId = data.custom_data.organizationId
            const payments = data.payments
            const creditAmount = payments.reduce((sum: number, payment: any) => sum + Number(payment.amount) / 100, 0)

			if (creditAmount <= 0) {
				throw new ValidationError("Credit amount must be greater than 0")
			}

			const params: ProcessCreditsPurchaseParams = {
				creditAmount,
				organizationId
			}

			console.log('Processing credits purchase for organization', JSON.stringify(params))
			
			await processCreditsPurchase.execute(params)
			return Responses._201({ message: "Credits added to organization balance" })
		} catch (error) {
			return errorHandler(error)
		}
	}
}
