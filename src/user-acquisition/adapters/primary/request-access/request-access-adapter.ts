import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { ValidationError } from "@errors/validation-error"
import { errorHandler } from "@packages/apigw-error-handler"
import { schema } from "@schemas/implement-request.schema"
import { schemaValidator } from "@packages/schema-validator"
import Responses from "@utils/api-responses"
import { AccessRequestDto } from "src/user-acquisition/dto/access-request"
import { requestAccessUseCase } from "src/user-acquisition/use-cases/request-access/request-access"

export async function requestAccessHandler({ body }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	try {
		if (!body) throw new ValidationError("No request body")

		const accessRequest: AccessRequestDto = JSON.parse(body)

		schemaValidator(schema, accessRequest)

		console.log(`Access request: ${JSON.stringify(accessRequest)}`)

		await requestAccessUseCase(accessRequest)

		return Responses._201()
	} catch (error) {
		return errorHandler(error)
	}
}
