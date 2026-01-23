export interface IdentityManagementService {
	createUser(email: string): Promise<void>
	isUserExists(email: string): Promise<boolean>
	setAuthChallenge(email: string, challenge: string): Promise<void>
	verifyAuthChallenge(email: string, challenge: string): Promise<void>
}
