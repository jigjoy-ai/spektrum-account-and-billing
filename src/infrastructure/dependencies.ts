import { ArticleRepository } from "@domain/repositories/article-repository"
import { CreateArticleUseCase } from "@application/use-cases/create-article"
import { DynamoDBArticleRepository } from "@infrastructure/repositories/dynamodb-article-repository"

const articleRepository: ArticleRepository = new DynamoDBArticleRepository()
const createArticleUseCase = new CreateArticleUseCase(articleRepository)

export { createArticleUseCase }