import { ArticleRepository } from "@domain/repositories/article-repository"
import { FetchDraftsUseCase } from "@domain/use-cases/fetch-drafts"
import { Article } from "@domain/entities/article"

export class FetchDrafts implements FetchDraftsUseCase {
    constructor(private readonly articleRepository: ArticleRepository) {}

    async execute(): Promise<Article[]> {
        return await this.articleRepository.findByDraftStatus()
    }
} 