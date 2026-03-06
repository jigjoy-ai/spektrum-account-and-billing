import { OrganizationRepository } from "@app/ports/repositories/organization-repository"
import { DynamoDBOrganizationRepository } from "@infra/repositories/organization-repository/dynamodb-organization-repository"

export const organizationRepository: OrganizationRepository = new DynamoDBOrganizationRepository()
