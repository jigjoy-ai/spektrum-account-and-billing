export interface IdentityManagementService {
	createUser(email: string): Promise<void>
	isUserExists(email: string): Promise<boolean>
	setAuthToken(email: string, token: string): Promise<void>
	verifyAuthToken(email: string, token: string): Promise<void>
}
