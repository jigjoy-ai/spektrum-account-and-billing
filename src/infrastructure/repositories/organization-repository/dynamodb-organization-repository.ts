import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb"
import { OrganizationRepository } from "@app/ports/repositories/organization-repository"
import { Organization } from "@domain/organization"
import { OrganizationMapper } from "@infra/repositories/mappers/organization-mapper"
import { OrganizationRecord } from "@infra/repositories/records/organization-record"
import { OrganizationMemberRecord } from "../records/organization-member"



const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  profile: process.env.AWS_PROFILE,
})
const ddbDocClient = DynamoDBDocumentClient.from(client)

export class DynamoDBOrganizationRepository implements OrganizationRepository {

	async getById(id: string): Promise<Organization | null> {
		const tableName = process.env.ORGANIZATION_TABLE as string
		const membersTable = process.env.ORGANIZATION_MEMBER_TABLE as string

		const result = await ddbDocClient.send(
		new GetCommand({
			TableName: tableName,
			Key: { id },
		}))

		if (!result.Item) return null

		const record: OrganizationRecord = result.Item as OrganizationRecord

		// ✅ Load members from OrganizationMember table
		const members = await this.getMembersByOrganizationId(record.id, membersTable)

		return OrganizationMapper.toDomain(record, members)
	}

	async save(organization: Organization): Promise<Organization> {
		const tableName = process.env.ORGANIZATION_TABLE as string
		const membersTable = process.env.ORGANIZATION_MEMBER_TABLE as string

		const record: OrganizationRecord = OrganizationMapper.toRecord(organization)

		await ddbDocClient.send(
		new PutCommand({
			TableName: tableName,
			Item: record,
		}),
		)

		// ✅ Persist members
		await this.persistMembers(organization, membersTable)

		return organization
	}

	async getByOwnerId(ownerId: string): Promise<Organization | null> {
		const tableName = process.env.ORGANIZATION_TABLE as string
		const membersTable = process.env.ORGANIZATION_MEMBER_TABLE as string

		const result = await ddbDocClient.send(
		new QueryCommand({
			TableName: tableName,
			IndexName: "ownerIdGSI",
			KeyConditionExpression: "ownerId = :ownerId",
			ExpressionAttributeValues: { ":ownerId": ownerId },
			Limit: 1,
		}),
		)

		if (!result.Items || result.Items.length === 0) return null

		const record: OrganizationRecord = result.Items[0] as OrganizationRecord

		const members = await this.getMembersByOrganizationId(record.id, membersTable)

		return OrganizationMapper.toDomain(record, members)
	}

	private async getMembersByOrganizationId(
		organizationId: string,
		membersTable: string,
	): Promise<OrganizationMemberRecord[]> {
		const res = await ddbDocClient.send(
		new QueryCommand({
			TableName: membersTable,
			IndexName: "organizationIdGSI",
			KeyConditionExpression: "organizationId = :oid",
			ExpressionAttributeValues: { ":oid": organizationId },
		}),
		)

		return (res.Items ?? []) as OrganizationMemberRecord[]
	}

	private async persistMembers(org: Organization, membersTable: string): Promise<void> {
		const organizationId = org.getId()

		// You MUST adapt these two lines to your domain methods:

		if (!org.getOwnerId()) throw new Error("Organization ownerId missing")

		const members = org.getMembers()

		const chunks = chunk(members, 25)

		for (const c of chunks) {
		await ddbDocClient.send(
			new BatchWriteCommand({
			RequestItems: {
				[membersTable]: c.map((user) => ({
				PutRequest: {
					Item: {
					userId: user.getId(),
					userEmail: user.getEmail(),
					organizationId
					} satisfies OrganizationMemberRecord,
				},
				})),
			},
			}),
		)
		}
	}
}

function chunk<T>(arr: T[], size: number): T[][] {
	const out: T[][] = []
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
	return out
}