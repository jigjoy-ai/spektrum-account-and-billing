import { CreateApiKeyUseCase } from "@app/ports/use-cases/create-api-key"
import { CreateApiKey } from "@app/use-cases/create-api-key"
import { createCreateApiKeyHandler } from "@infra/http/factories/create-api-key"
import { accountRepository } from "@infra/repositories/account-repository"
import { apiKeyRepository } from "@infra/repositories/api-key-repository"

export const createApiKeyUseCase: CreateApiKeyUseCase = new CreateApiKey(accountRepository, apiKeyRepository)

export const handler = createCreateApiKeyHandler(createApiKeyUseCase)
