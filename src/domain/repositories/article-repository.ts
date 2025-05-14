import { Article } from "../entities/article"

export interface ArticleRepository {
	createArticle(article: Article): Promise<Article>
	getArticles(): Promise<Article[]>
}
