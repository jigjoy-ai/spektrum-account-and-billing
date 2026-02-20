import { Organization } from "@domain/organization"
import { User } from "@domain/user"
import { OrganizationRecord } from "@infra/repositories/records/organization-record"
import { OrganizationMemberRecord } from "@infra/repositories/records/organization-member"

export class OrganizationMapper {
	static toRecord(organization: Organization): OrganizationRecord {
		return {
			id: organization.getId(),
			ownerId: organization.getOwnerId(),
			creditsUsd: organization.getRemainingCredits()
		}
	}

	static toDomain(record: OrganizationRecord, members: OrganizationMemberRecord[]): Organization {
		return Organization.rehydrate(record.id, record.ownerId, Number(record.creditsUsd), members.map(member => User.rehydrate(member.userId, member.userEmail)))
	}
}
