import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { PreTokenGenerationTriggerEvent } from "aws-lambda"

const ddbClient = new DynamoDBClient({})
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)

async function getAccountIdByEmail(email: string): Promise<string | null> {
	const tableName = process.env.ACCOUNT_TABLE
	if (!tableName) {
		console.error("PreTokenGeneration - ACCOUNT_TABLE not set")
		return null
	}
	const result = await ddbDocClient.send(
		new QueryCommand({
			TableName: tableName,
			IndexName: "rootEmailGSI",
			KeyConditionExpression: "rootEmail = :rootEmail",
			ExpressionAttributeValues: { ":rootEmail": email },
		}),
	)
	const item = result.Items?.[0] as { id?: string } | undefined
	return item?.id ?? null
}

export async function preTokenGenerationHandler(
	event: PreTokenGenerationTriggerEvent,
): Promise<PreTokenGenerationTriggerEvent> {
	const email = event.request.userAttributes.email
	console.log(
		"PreTokenGeneration - Trigger called",
		JSON.stringify({
			triggerSource: event.triggerSource,
			hasEmail: !!email,
		}),
	)

	const claimsToAdd: Record<string, string> = {}
	if (email) {
		claimsToAdd.email = email
	}
	const accountId = email ? await getAccountIdByEmail(email) : null
	if (accountId) {
		claimsToAdd.accountId = accountId
		console.log("PreTokenGeneration - Added accountId to claims", accountId)
	}
	if (Object.keys(claimsToAdd).length > 0) {
		event.response.claimsOverrideDetails = {
			claimsToAddOrOverride: claimsToAdd,
		}
	}

	return event
}
