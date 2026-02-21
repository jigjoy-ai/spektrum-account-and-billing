import { ApiKeyStatus } from "@domain/api-key"

export interface ApiKeyRecord {
	id: string
	keyHash: string
	organizationId: string
	displayKey: string
	createdBy: string
	statusCreatedAt: string
	name: string
	createdAt: string
	status: ApiKeyStatus
}
