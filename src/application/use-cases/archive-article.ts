import { ArticleRepository } from "@domain/repositories/article-repository"
import { ArchiveArticleUseCase } from "@domain/use-cases/archive-article"
import { Article } from "@domain/entities/article"
import { ValidationError } from "@packages/errors/validation-error"

export class ArchiveArticle implements ArchiveArticleUseCase {
    constructor(private readonly articleRepository: ArticleRepository) {}

    async execute(id: string): Promise<Article> {
        const article = await this.articleRepository.findById(id)
        
        if (!article) {
            throw new ValidationError(`Article with id ${id} not found`)
        }

        article.archive()
        return await this.articleRepository.save(article)
    }
} 