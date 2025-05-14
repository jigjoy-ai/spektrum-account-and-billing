import { Article } from "@domain/entities/article"

export interface CreateArticle {
    execute(title: string, imageUrl: string, description: string, workflowId: string, keywords: string[]): Promise<Article>
}