import { ApiKeyRepository } from "@app/ports/repositories/api-key-repository"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { ApiKey } from "@domain/api-key"
import { ApiKeyRecord } from "@infra/repositories/records/api-key-record"
import { ApiKeyMapper } from "@infra/repositories/mappers/api-key-mapper"

const client = new DynamoDBClient({
	region: process.env.AWS_REGION,
	profile: process.env.AWS_PROFILE,
})
const ddbDocClient = DynamoDBDocumentClient.from(client)

export class DynamoDBApiKeyRepository implements ApiKeyRepository {
	async getById(id: string): Promise<ApiKey | null> {
		const tableName = process.env.API_KEY_TABLE as string
		console.log(`Getting api key with id: ${id} from DynamoDB table ${tableName}`)

		const result = await ddbDocClient.send(
			new GetCommand({
				TableName: tableName,
				Key: { id: id },
			}),
		)

		if (!result.Item) {
			console.log(`Api key with id ${id} not found`)
			return null
		}

		const record: ApiKeyRecord = result.Item as ApiKeyRecord
		return ApiKeyMapper.toDomain(record)
	}

	async getByHash(hash: string): Promise<ApiKey | null> {
		const tableName = process.env.API_KEY_TABLE as string
		console.log(`Getting api key with hash: ${hash} from DynamoDB table ${tableName}`)

		const result = await ddbDocClient.send(
			new QueryCommand({
				TableName: tableName,
				IndexName: "keyHashGSI",
				KeyConditionExpression: "keyHash = :hash",
				ExpressionAttributeValues: {
					":hash": hash,
				},
			}),
		)

		if (!result.Items || result.Items.length === 0) {
			console.log(`Api key with hash ${hash} not found`)
			return null
		}

		const record: ApiKeyRecord = result.Items[0] as ApiKeyRecord
		return ApiKeyMapper.toDomain(record)
	}

	async getActiveByOrganizationId(organizationId: string): Promise<ApiKey[]> {
		const tableName = process.env.API_KEY_TABLE as string
		console.log(`Getting active api keys for organization with id: ${organizationId} from DynamoDB table ${tableName}`)

		const result = await ddbDocClient.send(
			new QueryCommand({
				TableName: tableName,
				IndexName: "organizationIdStatusGSI",
				KeyConditionExpression: "organizationId = :organizationId AND begins_with(statusCreatedAt, :p)",
				ExpressionAttributeValues: {
					":organizationId": organizationId,
					":p": "ACTIVE#",
				},
				// optional: newest first
				ScanIndexForward: false,
			}),
		)

		if (!result.Items || result.Items.length === 0) {
			console.log(`No active api keys found for organization with id: ${organizationId}`)
			return []
		}

		const records: ApiKeyRecord[] = result.Items.map((item) => item as ApiKeyRecord)

		return ApiKeyMapper.toDomains(records)
	}

	async save(apiKey: ApiKey): Promise<ApiKey> {
		const tableName = process.env.API_KEY_TABLE as string
		console.log(`Saving api key with hash: ${apiKey.getKeyHash()} to DynamoDB table ${tableName}`)

		const record: ApiKeyRecord = ApiKeyMapper.toRecord(apiKey)
		await ddbDocClient.send(
			new PutCommand({
				TableName: tableName,
				Item: record,
			}),
		)
		return apiKey
	}
}
