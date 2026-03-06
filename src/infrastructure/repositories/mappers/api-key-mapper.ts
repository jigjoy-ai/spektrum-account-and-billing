import { ApiKey } from "@domain/api-key"
import { ApiKeyRecord } from "../records/api-key-record"

export class ApiKeyMapper {
	static toRecord(apiKey: ApiKey): ApiKeyRecord {
		return {
			id: apiKey.getId(),
			keyHash: apiKey.getKeyHash(),
			organizationId: apiKey.getOrganizationId(),
			displayKey: apiKey.getDisplayKey(),
			createdBy: apiKey.getCreatedBy(),
			statusCreatedAt: apiKey.getStatus() + "#" + apiKey.getCreatedAt(),
			name: apiKey.getName(),
			createdAt: apiKey.getCreatedAt(),
			status: apiKey.getStatus(),
		}
	}

	static toDomain(record: ApiKeyRecord): ApiKey {
		return ApiKey.rehydrate(
			record.id,
			record.keyHash,
			record.organizationId,
			record.createdBy,
			record.displayKey,
			record.status,
			record.name,
			record.createdAt,
		)
	}

	static toDomains(records: ApiKeyRecord[]): ApiKey[] {
		return records.map((record) => ApiKeyMapper.toDomain(record))
	}
}
