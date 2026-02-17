import { ApiKeyRepository } from "@app/ports/repositories/api-key-repository"
import { DynamoDBApiKeyRepository } from "@infra/repositories/api-key-repository/dynamodb-api-key-repository"

export const apiKeyRepository: ApiKeyRepository = new DynamoDBApiKeyRepository()
