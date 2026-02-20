export interface UserDataDTO {
	userId: string
	organizationId: string
	email: string
	credits: number,
    apiKeys: ApiKeyDTO[]
}

export interface ApiKeyDTO {
	id: string
	name: string
	key: string
}

export interface AuthSessionDTO {
	accessToken: string
	userData: UserDataDTO
}