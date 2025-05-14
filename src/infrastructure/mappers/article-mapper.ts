import { Article } from "@domain/entities/article"
import { ArticleRecord } from "@infrastructure/records/article"



export class ArticleMapper {

  /** Converts an Article domain entity to a raw record */
  static toRecord(article: Article): ArticleRecord {
    return {
        id: article.id,
        title: article.title,
        description: article.description,
        workflowId: article.workflowId,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        status: article.status,
        keywords: article.keywords,
        imageUrl: article.imageUrl
    }
  }

  /** Converts a raw article record back to an Article domain entity */
  static toDomain(record: ArticleRecord): Article {
    return Article.rehydrate({
        id: record.id,
        title: record.title,
        description: record.description,
        workflowId: record.workflowId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        status: record.status,
        keywords: record.keywords,
        imageUrl: record.imageUrl
    })
  }

  static toDomains(items: ArticleRecord[]): Article[] {
		let articles: Article[] = []
		for (const article of items) {
			articles.push(this.toDomain(article))
		}
		return articles
	}
}
