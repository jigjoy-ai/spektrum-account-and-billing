import { ApiKeyRepository } from "@app/ports/repositories/api-key-repository"
import { ApiKey, ApiKeyStatus } from "@domain/api-key"

export class InMemoryApiKeyRepository implements ApiKeyRepository {
	private apiKeys: Map<string, ApiKey> = new Map()

	// Failure injection flags
	private shouldFailOnSave: boolean = false
	private shouldFailOnGetById: boolean = false
	private shouldFailOnGetByHash: boolean = false
	private shouldFailOnGetActiveByOrganizationId: boolean = false
	private failureError: Error = new Error("ApiKey repository unavailable")

	async save(apiKey: ApiKey): Promise<ApiKey> {
		if (this.shouldFailOnSave) {
			throw this.failureError
		}
		this.apiKeys.set(apiKey.getId(), apiKey)
		return apiKey
	}

	async getById(id: string): Promise<ApiKey | null> {
		if (this.shouldFailOnGetById) {
			throw this.failureError
		}
		return this.apiKeys.get(id) ?? null
	}

	async getByHash(hash: string): Promise<ApiKey | null> {
		if (this.shouldFailOnGetByHash) {
			throw this.failureError
		}
		for (const apiKey of this.apiKeys.values()) {
			if (apiKey.getKeyHash() === hash) {
				return apiKey
			}
		}
		return null
	}

	async getActiveByOrganizationId(organizationId: string): Promise<ApiKey[]> {
		if (this.shouldFailOnGetActiveByOrganizationId) {
			throw this.failureError
		}
		const result: ApiKey[] = []
		for (const apiKey of this.apiKeys.values()) {
			if (apiKey.getOrganizationId() === organizationId && apiKey.getStatus() === ApiKeyStatus.ACTIVE) {
				result.push(apiKey)
			}
		}
		return result
	}

	// Helper methods for testing
	getApiKeys(): ApiKey[] {
		return Array.from(this.apiKeys.values())
	}

	setShouldFailOnSave(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnSave = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnGetById(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnGetById = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnGetByHash(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnGetByHash = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnGetActiveByOrganizationId(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnGetActiveByOrganizationId = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	clear(): void {
		this.apiKeys.clear()
		this.shouldFailOnSave = false
		this.shouldFailOnGetById = false
		this.shouldFailOnGetByHash = false
		this.shouldFailOnGetActiveByOrganizationId = false
		this.failureError = new Error("ApiKey repository unavailable")
	}
}
