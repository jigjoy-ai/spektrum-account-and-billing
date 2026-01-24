import { CurrentUser } from "@domain/current-user"

export interface IdentityManagementService {
	createUser(email: string): Promise<void>
	hasUser(email: string): Promise<boolean>
	getCurrentUserFromAccessToken(accessToken: string): Promise<CurrentUser>
	issueAuthChallenge(email: string, expirationInMinutes: number): Promise<string>
	verifyAuthChallenge(email: string, challenge: string): Promise<string>
}
