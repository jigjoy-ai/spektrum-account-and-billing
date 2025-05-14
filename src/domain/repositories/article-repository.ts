import { Article } from "../entities/article"

export interface ArticleRepository {
	save(article: Article): Promise<Article>
	findById(id: string): Promise<Article | null>
	findAll(): Promise<Article[]>
}
