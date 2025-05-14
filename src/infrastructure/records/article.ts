import { ArticleStatus } from "@domain/entities/article"


export interface ArticleRecord {
	id: string
	title: string
	imageUrl: string
	description: string
	workflowId: string
	keywords: string[]
	status: ArticleStatus
	createdAt: string
	updatedAt: string | null
}