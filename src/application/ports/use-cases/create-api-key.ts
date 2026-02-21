import { ApiKey } from "@domain/api-key"

export interface CreateApiKeyUseCase {
	execute(organizationId: string, userId: string, name: string): Promise<{ apiKey: ApiKey; rawKey: string }>
}
