
import { CreateArticleDto } from "@application/dto/create-article-dto"
import { Article } from "@domain/entities/article"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { ValidationError } from "@packages/errors/validation-error"
import { errorHandler } from "@packages/apigw-error-handler"
import Responses from "@utils/api-responses"
import { ArticleDtoMapper } from "@application/mappers/article-dto-mapper"
import { createArticleUseCase } from "@infrastructure/dependencies"

export async function createArticleHandler({ body }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        if (!body) throw new ValidationError("No request body")

        const article: CreateArticleDto = JSON.parse(body)
        //schemaValidator(accessRequestSchema, accessRequest)

        const createdArticle: Article = await createArticleUseCase.execute(article.title, article.imageUrl, article.description, article.workflowId, article.keywords)

        return Responses._201(ArticleDtoMapper.toDto(createdArticle))
    } catch (error) {
        console.error("Error creating article:", error)
        return errorHandler(error)
    }
}


