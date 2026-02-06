import { createCreateApiKeyHandler } from "@infra/http/factories/create-api-key"
import { createApiKeyUseCase } from "@infra/dependencies"

export const handler = createCreateApiKeyHandler(createApiKeyUseCase)
