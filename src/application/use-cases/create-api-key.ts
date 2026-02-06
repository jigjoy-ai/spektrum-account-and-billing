import { AccountRepository } from "@app/ports/repositories/account-repository"
import { ApiKeyRepository } from "@app/ports/repositories/api-key-repository"
import { CreateApiKeyUseCase } from "@app/ports/use-cases/create-api-key"
import { ApiKey } from "@domain/api-key"

export class CreateApiKey implements CreateApiKeyUseCase {
	constructor(private readonly accountRepository: AccountRepository, private readonly apiKeyRepository: ApiKeyRepository) {}

	async execute(accountId: string, name: string): Promise<string> {
		const account = await this.accountRepository.getById(accountId)
		if (!account) {
			throw new Error(`Account with id ${accountId} not found`)
		}

        
		const apiKey = ApiKey.create(accountId, name)
		await this.apiKeyRepository.save(apiKey)
		return apiKey.getKeyHash()
	}
}