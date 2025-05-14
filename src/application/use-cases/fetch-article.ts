import { ArticleRepository } from "@domain/repositories/article-repository"
import { Article } from "@domain/entities/article"
import { FetchArticleUseCase } from "@domain/use-cases/fetch-article"

export class FetchArticle implements FetchArticleUseCase {
    constructor(private readonly articleRepository: ArticleRepository) {}

    async execute(id: string): Promise<Article | null> {
        return await this.articleRepository.findById(id)
    }
}
