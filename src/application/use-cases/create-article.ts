import { Article } from "@domain/entities/article"
import { ArticleRepository } from "@domain/repositories/article-repository"
import { CreateArticle } from "@domain/use-cases/create-article"

export class CreateArticleUseCase implements CreateArticle {
    constructor(
        private readonly articleRepository: ArticleRepository
    ) {}

    execute(title: string, imageUrl: string, description: string, workflowId: string, keywords: string[]): Promise<Article> {

        try {
            const article = Article.create(title, imageUrl, description, workflowId, keywords)
            return this.articleRepository.save(article)
		} catch (error) {
			console.error("Error creating new article:", error)
			throw new Error("Failed to create new article.")
		}


    }

    
}