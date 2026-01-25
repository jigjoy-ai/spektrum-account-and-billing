import { AuthSession } from "@domain/auth-session"

export interface IdentityManagementService {
	createUser(email: string): Promise<void>
	hasUser(email: string): Promise<boolean>
	issueAuthChallenge(email: string, expirationInMinutes: number): Promise<string>
	verifyAuthChallenge(email: string, challenge: string): Promise<AuthSession>
}
