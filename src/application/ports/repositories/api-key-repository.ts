import { ApiKey } from "@domain/api-key"

export interface ApiKeyRepository {
	save(apiKey: ApiKey): Promise<ApiKey>
    getById(id: string): Promise<ApiKey | null>
    getByHash(hash: string): Promise<ApiKey | null>
	getActiveByOrganizationId(organizationId: string): Promise<ApiKey[]>
}