import { ApiKey } from "@domain/api-key"
import { AuthenticatedUseCase } from "@heksagon/app"
import { UserData } from "@jigjoy-ai/auth"

export type CreateApiKeyParams = {
	name: string
}

export type CreateApiKeyResponse = {
	apiKey: ApiKey
	rawKey: string
}

export type CreateApiKeyUseCase = AuthenticatedUseCase<UserData, CreateApiKeyParams, CreateApiKeyResponse>