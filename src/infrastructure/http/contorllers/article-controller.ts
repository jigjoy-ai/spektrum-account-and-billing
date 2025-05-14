import { ArticleDtoMapper } from "@application/mappers/project-dto-mappers"
import { createArticle, fetchArticle, fetchArticles }  from "@infrastructure/dependencies"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { ValidationError } from "@packages/errors/validation-error"
import { errorHandler } from "@packages/apigw-error-handler"
import Responses from "@utils/api-responses"
export class ArticleController {

	constructor() {}

    async createArticle({ body }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        try {
            if (!body) throw new ValidationError("No request body")
    
            //schemaValidator(accessRequestSchema, accessRequest)
    
            await createArticleUseCase(JSON.parse(body))
    
            return Responses._201()
        } catch (error) {
            return errorHandler(error)
			console.error("Error creating article:", error)
        }
    }


}





