import { Article } from "../entities/article"

export interface FetchArticlesUseCase {
    execute(): Promise<Article[]>
} 