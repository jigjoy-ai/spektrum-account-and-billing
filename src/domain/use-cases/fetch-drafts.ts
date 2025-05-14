import { Article } from "../entities/article"

export interface FetchDraftsUseCase {
    execute(): Promise<Article[]>
} 