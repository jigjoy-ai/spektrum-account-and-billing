import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { ValidationError } from "@errors/validation-error"
import { errorHandler } from "@packages/apigw-error-handler"
import { schema } from "@schemas/implement-request.schema"
import { schemaValidator } from "@packages/schema-validator"
import Responses from "@utils/api-responses"
import { ChangeRequestDto, ProjectDto, SourceCode } from "@dto/project"
import { implementRequesttUseCase } from "@use-cases/implement-request/implement-request"

export async function implementRequestHandler({ body }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	try {
		if (!body) throw new ValidationError("No request body")

		const changeRequest: ChangeRequestDto = JSON.parse(body)

		schemaValidator(schema, changeRequest)

		console.log(`Change request: ${JSON.stringify(changeRequest)}`)

		const refactoredProject: SourceCode = await implementRequesttUseCase(changeRequest)

		console.log(`Refactored project: ${JSON.stringify(refactoredProject)}`)

		return Responses._201(refactoredProject)
	} catch (error) {
		return errorHandler(error)
	}
}
