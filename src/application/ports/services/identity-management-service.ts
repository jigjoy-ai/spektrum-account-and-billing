import { AuthSession } from "@domain/auth-session"
import { UserIdentity } from "@domain/user-identity"

export interface IdentityManagementService {
	create(email: string): Promise<UserIdentity>
	exists(email: string): Promise<boolean>
	get(email: string): Promise<UserIdentity | null>
	issueAuthChallenge(email: string, expirationInMinutes: number): Promise<string>
	verifyAuthChallenge(email: string, challenge: string): Promise<AuthSession>
}
