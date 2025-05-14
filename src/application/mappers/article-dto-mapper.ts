import { ArticleDto } from "@application/dto/create-article-dto"
import { Article } from "@domain/entities/article"

export class ArticleDtoMapper {
  /** Maps a single domain Article entity to a DTO */
  static toDto(article: Article): ArticleDto {
    return {
      id: article.id,
      title: article.title,
      imageUrl: article.imageUrl,
      description: article.description,
      workflowId: article.workflowId,
      keywords: article.keywords,
      createdAt: article.createdAt
    }
  }

  /** Maps an array of domain Article entities to DTOs */
  static toDtos(articles: Article[]): ArticleDto[] {
    return articles.map(this.toDto)
  }
}
