import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { AccountRepository } from "@app/ports/repositories/account-repository"
import { Account } from "@domain/account"
import { AccountMapper } from "@infra/repositories/mappers/account-mapper"
import { AccountRecord } from "@infra/repositories/records/account-record"

const client = new DynamoDBClient({
	region: process.env.AWS_REGION,
	profile: process.env.AWS_PROFILE,
})
const ddbDocClient = DynamoDBDocumentClient.from(client)

export class DynamoDBAccountRepository implements AccountRepository {
	async save(account: Account): Promise<Account> {
		const tableName = process.env.ACCOUNT_TABLE as string
		console.log(`Saving account with id: ${account.getId()} to DynamoDB table ${tableName}`)

		const record: AccountRecord = AccountMapper.toRecord(account)

		await ddbDocClient.send(
			new PutCommand({
				TableName: tableName,
				Item: record,
			}),
		)
		return account
	}

	async getByEmail(email: string): Promise<Account | null> {
		const tableName = process.env.ACCOUNT_TABLE as string
		console.log(`Getting account by email: ${email} from DynamoDB table ${tableName}`)

		try {
			const result = await ddbDocClient.send(
				new QueryCommand({
					TableName: tableName,
					IndexName: "rootEmailGSI",
					KeyConditionExpression: "rootEmail = :rootEmail",
					ExpressionAttributeValues: { ":rootEmail": email },
				}),
			)

			if (!result.Items || result.Items.length === 0) {
				console.log(`Account with rootEmail ${email} not found`)
				return null
			}

			const record: AccountRecord = result.Items[0] as AccountRecord
			return AccountMapper.toDomain(record)
		} catch (error) {
			console.error(`Error getting account by email ${email}:`, error)
			throw new Error(`Failed to get account by email ${email}: ${error}`)
		}
	}

	async exists(email: string): Promise<boolean> {
		const account = await this.getByEmail(email)
		return account !== null
	}
}
