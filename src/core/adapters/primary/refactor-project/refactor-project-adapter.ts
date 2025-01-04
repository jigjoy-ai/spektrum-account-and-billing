import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { ValidationError } from "@errors/validation-error"
import { errorHandler } from "@packages/apigw-error-handler"
import { schema } from "@schemas/refactor-project.schema"
import { schemaValidator } from "@packages/schema-validator"
import Responses from "@utils/api-responses"
import { RefactorProjectDto, ReturnProjectDto } from "@dto/project"
import { refactorProjectUseCase } from "@use-cases/refactor-project"


export async function refactorProjectHandler({ body }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	try {
		if (!body) throw new ValidationError("No request body")

		const refactorRequest: RefactorProjectDto = JSON.parse(body)

		schemaValidator(schema, refactorRequest)

		console.log(`project: ${JSON.stringify(refactorRequest)}`)

		const refactredProject: ReturnProjectDto = await refactorProjectUseCase(refactorRequest)

		console.log(`Refactored project: ${JSON.stringify(refactredProject)}`)

		return Responses._201(refactredProject)
	} catch (error) {
		return errorHandler(error)
	}
}