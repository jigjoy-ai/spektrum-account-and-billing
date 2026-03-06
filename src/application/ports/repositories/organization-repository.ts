import { Organization } from "@domain/organization"

export interface OrganizationRepository {
	save(organization: Organization): Promise<Organization>
	getByOwnerId(ownerId: string): Promise<Organization | null>
	getById(id: string): Promise<Organization | null>
}
