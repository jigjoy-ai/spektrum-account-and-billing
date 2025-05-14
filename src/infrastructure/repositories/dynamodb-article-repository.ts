import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { ArticleRepository } from "@domain/repositories/article-repository"
import { Article, ArticleStatus } from "@domain/entities/article"
import { ArticleRecord } from "@infrastructure/records/article"
import { ArticleMapper } from "@infrastructure/mappers/article-mapper"

const client = new DynamoDBClient({
	region: process.env.AWS_REGION,
	profile: process.env.AWS_PROFILE,
})
const ddbDocClient = DynamoDBDocumentClient.from(client)

export class DynamoDBArticleRepository implements ArticleRepository {

	async save(article: Article): Promise<Article> {
		const tableName = process.env.ARTICLE_TABLE

		console.log(`Saving article with ${article.id} to dynamodb table ${tableName}.`)

		const articleRecord: ArticleRecord = ArticleMapper.toRecord(article)

		const params = {
			TableName: tableName,
			Item: articleRecord,
		}

		await ddbDocClient.send(new PutCommand(params))

		return article
	}

	async findById(id: string): Promise<Article> {
		const tableName = process.env.ARTICLE_TABLE

		console.log(`Fetching article with ${id} from dynamodb table ${tableName}.`)
		const params = {
			TableName: tableName,
			Key: { id },
		}

		const { Item: item } = await ddbDocClient.send(new GetCommand(params))

		if (!item) throw new Error(`Project not found!`)

		const articleRecord: ArticleRecord = item as ArticleRecord

		return ArticleMapper.toDomain(articleRecord)
	}

	async findAll(): Promise<Article[]> {
		const tableName = process.env.ARTICLE_TABLE

		const params = {
			KeyConditionExpression: "#status = :status",
			IndexName: "statusGSI",
            ExpressionAttributeNames: {
                "#status": "status"
            },
			ExpressionAttributeValues: {
				":status": ArticleStatus.PUBLISHED,
			},
			TableName: tableName,
		}
	
		const data = await ddbDocClient.send(new QueryCommand(params))
		const items = data.Items as []
	
		return ArticleMapper.toDomains(items)
	}

	async findByDraftStatus(): Promise<Article[]> {
		const tableName = process.env.ARTICLE_TABLE

		const params = {
			KeyConditionExpression: "#status = :status",
			IndexName: "statusGSI",
            ExpressionAttributeNames: {
                "#status": "status"
            },
			ExpressionAttributeValues: {
				":status": ArticleStatus.DRAFT,
			},
			TableName: tableName,
		}
	
		const data = await ddbDocClient.send(new QueryCommand(params))
		const items = data.Items as []
	
		return ArticleMapper.toDomains(items)
	}
}