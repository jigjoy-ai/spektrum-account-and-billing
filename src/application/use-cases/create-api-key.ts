import { OrganizationRepository } from "@app/ports/repositories/organization-repository"
import { ApiKeyRepository } from "@app/ports/repositories/api-key-repository"
import { CreateApiKeyUseCase } from "@app/ports/use-cases/create-api-key"
import { ApiKey } from "@domain/api-key"

export class CreateApiKey implements CreateApiKeyUseCase {
	constructor(
		private readonly organizationRepository: OrganizationRepository,
		private readonly apiKeyRepository: ApiKeyRepository,
	) {}

	async execute(organizationId: string, userId: string, name: string): Promise<{ apiKey: ApiKey; rawKey: string }> {
		const organization = await this.organizationRepository.getById(organizationId)
		if (!organization) {
			throw new Error(`Organization with id ${organizationId} not found`)
		}

		const createApiKeyResult = ApiKey.create(organizationId, userId, name)
		await this.apiKeyRepository.save(createApiKeyResult.apiKey)
		return createApiKeyResult
	}
}
