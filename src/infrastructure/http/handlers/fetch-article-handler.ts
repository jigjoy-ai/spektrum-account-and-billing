import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { ValidationError } from "@packages/errors/validation-error"
import { errorHandler } from "@packages/apigw-error-handler"
import Responses from "@utils/api-responses"
import { fetchArticleUseCase } from "@infrastructure/dependencies"

export async function fetchArticleHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const id = event.pathParameters?.id
        if (!id) throw new ValidationError("Article ID is required")

        try {
            const article = await fetchArticleUseCase.execute(id)
            return Responses._200(article)
        } catch (error) {
            return Responses._404("Article not found")
        }
    } catch (error) {
        return errorHandler(error)
    }
} 