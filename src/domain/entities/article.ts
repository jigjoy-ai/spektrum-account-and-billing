import { v4 as uuidv4 } from "uuid"

export enum ArticleStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}

export class Article {
    public readonly id: string;
    public title: string;
    public imageUrl: string;
    public description: string;
    public workflowId: string;
    public keywords: string[];
    public status: ArticleStatus;
    public readonly createdAt: string
    updatedAt: string | null

    private constructor(
        id: string,
        title: string,
        imageUrl: string,
        description: string,
        workflowId: string,
        keywords: string[],
        status: ArticleStatus,
        createdAt: string,
        updatedAt: string | null
    ) {
        this.id = id;
        this.title = title; 
        this.imageUrl = imageUrl;
        this.description = description;
        this.workflowId = workflowId;
        this.keywords = keywords;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static create(
        title: string,
        imageUrl: string,
        description: string,
        workflowId: string,
        keywords: string[]
    ): Article {
        return new Article(
            uuidv4(),
            title,
            imageUrl,
            description,
            workflowId,
            keywords,
            ArticleStatus.DRAFT,
            new Date().toISOString(),
            null
        )
    }

    public publish(): void {
        if (this.status === ArticleStatus.PUBLISHED) {
            throw new Error("Article is already published")
        }
        this.status = ArticleStatus.PUBLISHED
        this.updatedAt = new Date().toISOString()
    }

    public archive(): void {
        if (this.status === ArticleStatus.ARCHIVED) {
            throw new Error("Article is already archived")
        }
        this.status = ArticleStatus.ARCHIVED
        this.updatedAt = new Date().toISOString()
    }

    /** Restore method to rehydrate a article from persisted data */
    static rehydrate(data: {
        id: string
        title: string
        imageUrl: string
        description: string
        workflowId: string
        keywords: string[]
        status: ArticleStatus
        createdAt: string
        updatedAt: string | null
    }): Article {
        return new Article(
            data.id,
            data.title,
            data.imageUrl,
            data.description,
            data.workflowId,
            data.keywords,
            data.status,
            data.createdAt,
            data.updatedAt
        )
    }
}