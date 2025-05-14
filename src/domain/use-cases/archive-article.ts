import { Article } from "../entities/article"

export interface ArchiveArticleUseCase {
    execute(id: string): Promise<Article>
} 