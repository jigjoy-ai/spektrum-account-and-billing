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
		private readonly organizationId: string,
		private readonly createdBy: string,
		private readonly displayKey: string,
		private status: ApiKeyStatus,
		private readonly name: string,
		private readonly createdAt: string,
	) {}

	getId() {
		return this.id
	}

	getKeyHash() {
		return this.keyHash
	}

	getOrganizationId() {
		return this.organizationId
	}

	getCreatedBy() {
		return this.createdBy
	}

	getStatus() {
		return this.status
	}

	getName() {
		return this.name
	}

	getDisplayKey() {
		return this.displayKey
	}

	getCreatedAt() {
		return this.createdAt
	}

	revoke() {
		this.status = ApiKeyStatus.REVOKED
	}

	delete() {
		this.status = ApiKeyStatus.DELETED
	}

	static create(organizationId: string, createdBy: string, name: string): { apiKey: ApiKey; rawKey: string } {
		if (name.length === 0) throw new Error("Name must be at least 1 character")
		if (name.length > 25) throw new Error("Name must be less than or equal to 25 characters")

		const id = uuidv4()

		const rawKey = "sk-" + crypto.randomBytes(32).toString("hex")

		// TODO: investigate HMAC with a secret:
		// const keyHash = crypto.createHmac("sha256", process.env.API_KEY_HASH_SECRET!).update(rawKey).digest("hex")
		const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex")

		const displayKey = rawKey.substring(0, 6) + "..." + rawKey.substring(rawKey.length - 4)

		const createdAt = new Date().toISOString()

		return {
			rawKey,
			apiKey: new ApiKey(
				id,
				keyHash,
				organizationId,
				createdBy,
				displayKey,
				ApiKeyStatus.ACTIVE,
				name,
				createdAt,
			),
		}
	}

	static rehydrate(
		id: string,
		keyHash: string,
		organizationId: string,
		createdBy: string,
		displayKey: string,
		status: ApiKeyStatus,
		name: string,
		createdAt: string,
	): ApiKey {
		return new ApiKey(id, keyHash, organizationId, createdBy, displayKey, status, name, createdAt)
	}
}
