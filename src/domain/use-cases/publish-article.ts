import { Article } from "../entities/article"

export interface PublishArticleUseCase {
    execute(id: string): Promise<Article>
} 