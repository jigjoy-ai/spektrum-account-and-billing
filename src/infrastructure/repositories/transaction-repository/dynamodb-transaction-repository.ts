import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb"
import { TransactionRepository } from "@app/ports/repositories/transaction-repository"
import { Transaction } from "@domain/transaction"
import { TransactionMapper } from "@infra/repositories/mappers/transaction-mapper"
import { TransactionRecord } from "@infra/repositories/records/transaction-record"
import { PaginatedResult, Pagination } from "@app/value-objects/pagination"

const client = new DynamoDBClient({
	region: process.env.AWS_REGION,
	profile: process.env.AWS_PROFILE,
})
const ddbDocClient = DynamoDBDocumentClient.from(client)

export class DynamoDBTransactionRepository implements TransactionRepository {
	async save(transaction: Transaction): Promise<Transaction> {
		const tableName = process.env.TRANSACTION_TABLE as string

		if (!transaction.getId()) {
			throw new Error("transaction.id is required for saving. Missing ID may cause unintended document creation.")
		}

		console.log(`Saving transaction with id: ${transaction.getId()} to DynamoDB table ${tableName}`)

		const transactionRecord: TransactionRecord = TransactionMapper.toRecord(transaction)

		await ddbDocClient.send(
			new PutCommand({
				TableName: tableName,
				Item: transactionRecord,
			}),
		)

		return transaction
	}

	async getById(id: string): Promise<Transaction | null> {
		const tableName = process.env.TRANSACTION_TABLE as string

		console.log(`Fetching transaction by id: ${id} from DynamoDB table ${tableName}`)

		const result = await ddbDocClient.send(
			new GetCommand({
				TableName: tableName,
				Key: { id },
			}),
		)

		if (!result.Item) return null

		const transactionRecord: TransactionRecord = result.Item as TransactionRecord
		return TransactionMapper.toDomain(transactionRecord)
	}

	async getByOrganizationId(organizationId: string, pagination: Pagination): Promise<PaginatedResult<Transaction>> {
		const tableName = process.env.TRANSACTION_TABLE as string

		console.log(
			`Fetching transactions for organizationId: ${organizationId} with pagination: ${JSON.stringify(pagination)}`,
		)

		// First, get the total count for pagination metadata
		const countResult = await ddbDocClient.send(
			new QueryCommand({
				TableName: tableName,
				IndexName: "organizationIdGSI",
				KeyConditionExpression: "organizationId = :organizationId",
				ExpressionAttributeValues: {
					":organizationId": organizationId,
				},
				Select: "COUNT",
			}),
		)
		const totalItems = countResult.Count ?? 0
		const totalPages = Math.ceil(totalItems / pagination.pageSize)

		// Build query params for fetching items
		const queryParams: QueryCommandInput = {
			TableName: tableName,
			IndexName: "organizationIdGSI",
			KeyConditionExpression: "organizationId = :organizationId",
			ExpressionAttributeValues: {
				":organizationId": organizationId,
			},
			ScanIndexForward: false, // Sort in descending order (newest first)
			Limit: pagination.pageSize,
		}

		// For pages beyond the first, we need to skip previous pages to get ExclusiveStartKey
		if (pagination.pageNumber > 1) {
			const exclusiveStartKey = await this.getExclusiveStartKeyForPage(
				tableName,
				organizationId,
				pagination.pageNumber,
				pagination.pageSize,
			)
			if (exclusiveStartKey) {
				queryParams.ExclusiveStartKey = exclusiveStartKey
			}
		}

		const result = await ddbDocClient.send(new QueryCommand(queryParams))
		const transactionRecords: TransactionRecord[] = (result.Items ?? []) as TransactionRecord[]

		return {
			items: TransactionMapper.toDomains(transactionRecords),
			pagination: {
				pageNumber: pagination.pageNumber,
				pageSize: pagination.pageSize,
				totalPages,
				totalItems,
			},
		}
	}

	private async getExclusiveStartKeyForPage(
		tableName: string,
		organizationId: string,
		targetPage: number,
		pageSize: number,
	): Promise<Record<string, unknown> | undefined> {
		// Skip through pages to get the LastEvaluatedKey for the target page
		let lastEvaluatedKey: Record<string, unknown> | undefined = undefined
		const pagesToSkip = targetPage - 1

		for (let i = 0; i < pagesToSkip; i++) {
			const skipParams: QueryCommandInput = {
				TableName: tableName,
				IndexName: "organizationIdGSI",
				KeyConditionExpression: "organizationId = :organizationId",
				ExpressionAttributeValues: {
					":organizationId": organizationId,
				},
				ScanIndexForward: false,
				Limit: pageSize,
				ExclusiveStartKey: lastEvaluatedKey,
			}

			const result = await ddbDocClient.send(new QueryCommand(skipParams))
			lastEvaluatedKey = result.LastEvaluatedKey as Record<string, unknown> | undefined

			// If there's no more data, we've reached the end
			if (!lastEvaluatedKey) {
				break
			}
		}

		return lastEvaluatedKey
	}
}
