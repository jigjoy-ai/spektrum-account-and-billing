import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { errorHandler } from "@packages/apigw-error-handler"
import Responses from "@utils/api-responses"
import { archiveArticleUseCase } from "@infrastructure/dependencies"

export async function archiveArticleHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        if (!event.pathParameters?.id) {
            throw new Error("Article ID is required")
        }

        const article = await archiveArticleUseCase.execute(event.pathParameters.id)

        return Responses._200({ article })
    } catch (error) {
        return errorHandler(error)
    }
} 