import { ApiKey } from "@domain/api-key"

export interface CreateApiKeyUseCase {
	execute(organizationId: string, name: string): Promise<ApiKey>
}