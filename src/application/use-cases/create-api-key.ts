import { OrganizationRepository } from "@app/ports/repositories/organization-repository"
import { ApiKeyRepository } from "@app/ports/repositories/api-key-repository"
import { CreateApiKeyUseCase } from "@app/ports/use-cases/create-api-key"
import { ApiKey } from "@domain/api-key"

export class CreateApiKey implements CreateApiKeyUseCase {
	constructor(private readonly organizationRepository: OrganizationRepository, private readonly apiKeyRepository: ApiKeyRepository) {}

	async execute(organizationId: string, name: string): Promise<ApiKey> {
		const organization = await this.organizationRepository.getById(organizationId)
		if (!organization) {
			throw new Error(`Organization with id ${organizationId} not found`)
		}

        
		const apiKey = ApiKey.create(organizationId, name)
		await this.apiKeyRepository.save(apiKey)
		return apiKey
	}
}