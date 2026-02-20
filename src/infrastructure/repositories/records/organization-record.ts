import { User } from "@domain/user"

export interface OrganizationRecord {
	id: string
	ownerId: string
	creditsUsd: number
}
