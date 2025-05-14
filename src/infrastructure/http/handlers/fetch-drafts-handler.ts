import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { errorHandler } from "@packages/apigw-error-handler"
import Responses from "@utils/api-responses"
import { fetchDraftsUseCase } from "@infrastructure/dependencies"

export async function fetchDraftsHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const drafts = await fetchDraftsUseCase.execute()

        return Responses._200({ drafts })
    } catch (error) {
        return errorHandler(error)
    }
} 