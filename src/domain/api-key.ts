import crypto from "crypto"

export enum ApiKeyStatus {
	ACTIVE = "ACTIVE",
	REVOKED = "REVOKED",
	DELETED = "DELETED",
}

export class ApiKey {
	private constructor(
		private readonly keyHash: string,
		private readonly accountId: string,
		private readonly secretKey: string,
		private status: ApiKeyStatus,
		private readonly name: string,
		private readonly createdAt: Date,
	) {}

	getKeyHash(): string {
		return this.keyHash
	}

	getSecretKey(): string {
		return this.secretKey
	}

	getStatus(): ApiKeyStatus {
		return this.status
	}

	getCreatedAt(): Date {
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
		const keyHash = crypto.randomBytes(32).toString("hex")
		const secretKey = keyHash.substring(0, 8) + "xxxxxx" + keyHash.substring(keyHash.length - 8)
		const dateNow = new Date()
		return new ApiKey(keyHash, accountId, secretKey, ApiKeyStatus.ACTIVE, name, dateNow)
	}

	static rehydrate(
		keyHash: string,
		accountId: string,
		secretKey: string,
		status: ApiKeyStatus,
		name: string,
		createdAt: Date,
	): ApiKey {
		return new ApiKey(keyHash, accountId, secretKey, status, name, createdAt)
	}
}
