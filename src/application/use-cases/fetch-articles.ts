import { ArticleRepository } from "@domain/repositories/article-repository"
import { FetchArticlesUseCase } from "@domain/use-cases/fetch-articles"
import { Article } from "@domain/entities/article"

export class FetchArticles implements FetchArticlesUseCase {
    constructor(private readonly articleRepository: ArticleRepository) {}

    async execute(): Promise<Article[]> {
        return await this.articleRepository.findAll()
    }
}
