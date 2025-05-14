export type CreateArticleDto = {
    title: string
    imageUrl: string
    description: string
    workflowId: string
    keywords: string[]
}

export type ArticleDto = {
    id: string
    title: string
    imageUrl: string
    description: string
    workflowId: string
    keywords: string[]
    createdAt: string
}