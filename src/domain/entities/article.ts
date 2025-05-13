import { v4 as uuidv4 } from "uuid"

export class Article {
    public readonly id: string;
    public title: string;
    public imageUrl: string;
    public description: string;
    public workflowId: string;
    public keywords: string[];
    public readonly createdAt: string;
    updatedAt: string | null

    private constructor(
        id: string,
        title: string,
        imageUrl: string,
        description: string,
        workflowId: string,
        keywords: string[],
        createdAt: string,
        updatedAt: string | null
    ) {
        this.id = id;
        this.title = title; 
        this.imageUrl = imageUrl;
        this.description = description;
        this.workflowId = workflowId;
        this.keywords = keywords;
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
            new Date().toISOString(),
            null
        )
    }

    /** Restore method to rehydrate a article from persisted data */
	static rehydrate(data: {
		id: string
        title: string 
        imageUrl: string
        description: string
        workflowId: string
        keywords: string[]
        createdAt: string
        updatedAt: string | null
	}): Article {
		return new Article(data.id, data.title, data.imageUrl, data.description, data.workflowId, data.keywords, data.createdAt, data.updatedAt)
	}
    
}