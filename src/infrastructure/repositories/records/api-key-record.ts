import { ApiKeyStatus } from "@domain/api-key"

export interface ApiKeyRecord {
    id: string
    keyHash: string
    organizationId: string
    secretKey: string
    statusCreatedAt: string
    name: string
    createdAt: string,
    status: ApiKeyStatus
}