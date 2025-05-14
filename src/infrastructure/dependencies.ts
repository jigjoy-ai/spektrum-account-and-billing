import { ArticleRepository } from "@domain/repositories/article-repository"
import { CreateArticleUseCase } from "@application/use-cases/create-article"
import { DynamoDBArticleRepository } from "./repositories/dynamodb-article-repository"
import { FetchArticles } from "@application/use-cases/fetch-articles"
import { PublishArticle } from "@application/use-cases/publish-article"
import { ArchiveArticle } from "@application/use-cases/archive-article"
import { FetchDrafts } from "@application/use-cases/fetch-drafts"
import { FetchArticle } from "@application/use-cases/fetch-article"

// Repositories
export const articleRepository: ArticleRepository = new DynamoDBArticleRepository()

// Use cases
export const createArticleUseCase = new CreateArticleUseCase(articleRepository)
export const fetchArticlesUseCase = new FetchArticles(articleRepository)
export const publishArticleUseCase = new PublishArticle(articleRepository)
export const archiveArticleUseCase = new ArchiveArticle(articleRepository)
export const fetchDraftsUseCase = new FetchDrafts(articleRepository)
export const fetchArticleUseCase = new FetchArticle(articleRepository)