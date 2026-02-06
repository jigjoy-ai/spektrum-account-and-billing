import crypto from "crypto"
import { v4 as uuidv4 } from "uuid"

export enum ApiKeyStatus {
	ACTIVE = "ACTIVE",
	REVOKED = "REVOKED",
	DELETED = "DELETED",
}

export class ApiKey {
	private constructor(
		private readonly id: string,
		private readonly keyHash: string,
		private readonly accountId: string,
		private readonly secretKey: string,
		private status: ApiKeyStatus,
		private readonly name: string,
		private readonly createdAt: string,
	) {}

	getId(): string {
		return this.id
	}

	getKeyHash(): string {
		return this.keyHash
	}

	getSecretKey(): string {
		return this.secretKey
	}

	getStatus(): ApiKeyStatus {
		return this.status
	}

	getCreatedAt(): string {
		return this.createdAt
	}

	getAccountId(): string {
		return this.accountId
	}

	getName(): string {
		return this.name
	}

	revoke(): void {
		this.status = ApiKeyStatus.REVOKED
	}

	delete(): void {
		this.status = ApiKeyStatus.DELETED
	}

	static create(accountId: string, name: string): ApiKey {

		if(name.length === 0) {
			throw new Error("Name must be at least 1 character")
		}
		
		if(name.length > 25) {
			throw new Error("Name must be less than or equal to 25 characters")
		}

		const id = uuidv4()
		const keyHash = crypto.randomBytes(32).toString("hex")
		const secretKey = keyHash.substring(0, 8) + "-xxxxxx-" + keyHash.substring(keyHash.length - 8)
		const createdAt = new Date().toISOString()
		return new ApiKey(id, keyHash, accountId, secretKey, ApiKeyStatus.ACTIVE, name, createdAt)
	}

	static rehydrate(
		id: string,
		keyHash: string,
		accountId: string,
		secretKey: string,
		status: ApiKeyStatus,
		name: string,
		createdAt: string,
	): ApiKey {
		return new ApiKey(id, keyHash, accountId, secretKey, status, name, createdAt)
	}
}
