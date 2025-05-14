import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { errorHandler } from "@packages/apigw-error-handler"
import Responses from "@utils/api-responses"
import { fetchArticlesUseCase } from "@infrastructure/dependencies"

export async function fetchArticlesHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {

        const articles = await fetchArticlesUseCase.execute()

        return Responses._200({ articles })
    } catch (error) {
        return errorHandler(error)
    }
} 