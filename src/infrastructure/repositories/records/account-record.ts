export interface UserRecord {
	id: string
	email: string
}

export interface AccountRecord {
	id: string
	rootEmail: string
	creditsUsd: number
	users: UserRecord[]
}
