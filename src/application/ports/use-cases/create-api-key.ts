import { ApiKey } from "@domain/api-key"

export interface CreateApiKeyUseCase {
	execute(accountId: string, name: string): Promise<ApiKey>
}