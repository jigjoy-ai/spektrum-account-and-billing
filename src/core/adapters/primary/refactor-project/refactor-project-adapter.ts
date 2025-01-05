import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { ValidationError } from "@errors/validation-error"
import { errorHandler } from "@packages/apigw-error-handler"
import { schema } from "@schemas/refactor-project.schema"
import { schemaValidator } from "@packages/schema-validator"
import Responses from "@utils/api-responses"
import { RefactorProjectDto, ProjectDto } from "@dto/project"
import { refactorProjectUseCase } from "@use-cases/refactor-project/refactor-project"

export async function refactorProjectHandler({ body }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	try {
		if (!body) throw new ValidationError("No request body")

		const refactorRequest: RefactorProjectDto = JSON.parse(body)

		schemaValidator(schema, refactorRequest)

		console.log(`project: ${JSON.stringify(refactorRequest)}`)

		// Example Usage
		const existingProject: ProjectDto = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			files: {
				"/App.tsx": {
					code: "export default function App(){return <div>Hello, World!</div>}",
				},
			},
		}

		const refactoredProject: ProjectDto = await refactorProjectUseCase(existingProject, refactorRequest.message)

		console.log(`Refactored project: ${JSON.stringify(refactoredProject)}`)

		return Responses._201(refactoredProject)
	} catch (error) {
		return errorHandler(error)
	}
}
