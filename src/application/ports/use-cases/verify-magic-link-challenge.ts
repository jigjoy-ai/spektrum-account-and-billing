import { AuthSession } from "@domain/auth-session"

// This use case will be called automatically by the client to verify the magic link
export interface VerifyMagicLinkChallengeUseCase {
	execute(email: string, challenge: string): Promise<AuthSession>
}