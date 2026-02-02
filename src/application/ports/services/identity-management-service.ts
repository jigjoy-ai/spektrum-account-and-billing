import { AuthSession } from "@domain/auth-session"
import { User } from "@domain/user"

export interface IdentityManagementService {
	create(email: string): Promise<User>
	exists(email: string): Promise<boolean>
	get(email: string): Promise<User | null>
	issueAuthChallenge(email: string, expirationInMinutes: number): Promise<string>
	verifyAuthChallenge(email: string, challenge: string): Promise<AuthSession>
}
