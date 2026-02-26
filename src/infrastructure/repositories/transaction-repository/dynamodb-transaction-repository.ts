import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { TransactionRepository } from "@app/ports/repositories/transaction-repository"
import { Transaction } from "@domain/transaction"
import { TransactionMapper } from "@infra/repositories/mappers/transaction-mapper"
import { TransactionRecord } from "@infra/repositories/records/transaction-record"
import { Pagination } from "@app/value-objects/pagination"

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

	async getByOrganizationId(organizationId: string, pagination: Pagination): Promise<Transaction[]> {
		const tableName = process.env.TRANSACTION_TABLE as string

		console.log(
			`Fetching transactions for organizationId: ${organizationId} with pagination: ${JSON.stringify(pagination)}`,
		)

		const params = {
			TableName: tableName,
			IndexName: "organizationIdGSI",
			KeyConditionExpression: "organizationId = :organizationId",
			ExpressionAttributeValues: {
				":organizationId": organizationId,
			},
			ScanIndexForward: false, // Sort in descending order (newest first)
			Limit: pagination.pageSize,
		}

		// If not first page, add ExclusiveStartKey for pagination
		if (pagination.pageNumber > 1) {
			// For simplicity, we'll implement basic pagination
			// In a production environment, you might want to use a more sophisticated approach
			console.warn("Pagination beyond first page not fully implemented for DynamoDB")
		}

		const result = await ddbDocClient.send(new QueryCommand(params))
		const transactionRecords: TransactionRecord[] = (result.Items ?? []) as TransactionRecord[]

		return TransactionMapper.toDomains(transactionRecords)
	}
}
