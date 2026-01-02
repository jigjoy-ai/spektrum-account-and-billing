import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { schema } from "../schemas/magic-link"
import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-io/serverless-core"
import { sendMagicLinkUseCase } from "@infra/dependencies"


export async function sendMagicLinkHandler({ body }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	try {
		if (!body) 
			throw new ValidationError("No page body")

		const parsedBody = JSON.parse(body)
		schemaValidator(schema, parsedBody)

		const email = parsedBody.email

		await sendMagicLinkUseCase.execute(email)
		return Responses._202({ message: "Magic link sent successfully" })
	} catch (error) {
		return errorHandler(error)
	}
}
