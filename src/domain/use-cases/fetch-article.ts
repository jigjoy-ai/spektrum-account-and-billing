import { Article } from "@domain/entities/article";

export interface FetchArticleUseCase {
    execute(id: string): Promise<Article>
} 