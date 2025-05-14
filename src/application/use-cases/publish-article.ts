import { ArticleRepository } from "@domain/repositories/article-repository"
import { PublishArticleUseCase } from "@domain/use-cases/publish-article"
import { Article } from "@domain/entities/article"
import { ValidationError } from "@packages/errors/validation-error"

export class PublishArticle implements PublishArticleUseCase {
    constructor(private readonly articleRepository: ArticleRepository) {}

    async execute(id: string): Promise<Article> {
        const article = await this.articleRepository.findById(id)
        
        if (!article) {
            throw new ValidationError(`Article with id ${id} not found`)
        }

        article.publish()
        return await this.articleRepository.save(article)
    }
} 