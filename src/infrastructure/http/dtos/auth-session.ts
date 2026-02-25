export interface UserDataDTO {
	id: string
	organizationId: string
	email: string
	credits: number,
    apiKeys: ApiKeyDTO[]
}

export interface ApiKeyDTO {
	id: string
	name: string
	displayKey: string
	rawKey?: string
}

export interface AuthSessionDTO {
	accessToken: string
	userData: UserDataDTO
}