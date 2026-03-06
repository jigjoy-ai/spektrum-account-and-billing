import { OrganizationRepository } from "@app/ports/repositories/organization-repository"
import { ApiKeyRepository } from "@app/ports/repositories/api-key-repository"
import { CreateApiKeyParams, CreateApiKeyUseCase } from "@app/ports/use-cases/create-api-key"
import { ApiKey } from "@domain/api-key"
import { Auth } from "@heksagon/app";
import { UserData } from "@jigjoy-ai/auth";

export class CreateApiKey implements CreateApiKeyUseCase {
	constructor(
		private readonly organizationRepository: OrganizationRepository,
		private readonly apiKeyRepository: ApiKeyRepository,
	) {}

	async execute(auth: Auth<UserData>, params: CreateApiKeyParams): Promise<{ apiKey: ApiKey; rawKey: string }> {

		console.log(`Auth data: ${JSON.stringify(auth.data)}`)
		
		const { name } = params
		const organizationId = auth.data.organizationId
		const userId = auth.data.userId

		const organization = await this.organizationRepository.getById(organizationId)
		if (!organization) {
			throw new Error(`Organization with id ${organizationId} not found`)
		}

		const createApiKeyResult = ApiKey.create(organizationId, userId, name)
		await this.apiKeyRepository.save(createApiKeyResult.apiKey)
		return createApiKeyResult
	}
}
