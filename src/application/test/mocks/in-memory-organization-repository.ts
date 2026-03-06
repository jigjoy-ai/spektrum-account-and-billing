import { OrganizationRepository } from "@app/ports/repositories/organization-repository"
import { Organization } from "@domain/organization"

export class InMemoryOrganizationRepository implements OrganizationRepository {
	private organizations: Map<string, Organization> = new Map()

	// Failure injection flags
	private shouldFailOnSave: boolean = false
	private shouldFailOnGetByOwnerId: boolean = false
	private shouldFailOnGetById: boolean = false
	private failureError: Error = new Error("Organization repository unavailable")

	async save(organization: Organization): Promise<Organization> {
		if (this.shouldFailOnSave) {
			throw this.failureError
		}
		this.organizations.set(organization.getId(), organization)
		return organization
	}

	async getByOwnerId(ownerId: string): Promise<Organization | null> {
		if (this.shouldFailOnGetByOwnerId) {
			throw this.failureError
		}
		for (const organization of this.organizations.values()) {
			if (organization.getOwnerId() === ownerId) {
				return organization
			}
		}
		return null
	}

	async getById(id: string): Promise<Organization | null> {
		if (this.shouldFailOnGetById) {
			throw this.failureError
		}
		return this.organizations.get(id) ?? null
	}

	// Helper methods for testing
	getOrganizations(): Organization[] {
		return Array.from(this.organizations.values())
	}

	setShouldFailOnSave(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnSave = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnGetByOwnerId(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnGetByOwnerId = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnGetById(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnGetById = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	clear(): void {
		this.organizations.clear()
		this.shouldFailOnSave = false
		this.shouldFailOnGetByOwnerId = false
		this.shouldFailOnGetById = false
		this.failureError = new Error("Organization repository unavailable")
	}
}
