
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb"
import { AccessRequestDto } from "src/user-acquisition/dto/access-request"
const client = new DynamoDBClient({})
const ddbDocClient = DynamoDBDocumentClient.from(client)

const tableName = process.env.ACCESS_REQUEST_TABLE

export async function putAccessRequest(request: AccessRequestDto): Promise<void> {
	const params = {
		TableName: tableName,
		Item: request,
	}

	await ddbDocClient.send(new PutCommand(params))
}