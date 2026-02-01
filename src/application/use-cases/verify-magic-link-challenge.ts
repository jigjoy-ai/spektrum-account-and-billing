import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"
import { AuthSession } from "@domain/auth-session"

export class VerifyMagicLinkChallenge implements VerifyMagicLinkChallengeUseCase {
	constructor(private readonly identityManagementService: IdentityManagementService) {}

	async execute(email: string, challenge: string): Promise<AuthSession> {
		const user = await this.identityManagementService.get(email)

		if (!user) {
			throw new Error("User does not exist. Please create an account.")
		}

		const authSession: AuthSession = await this.identityManagementService.verifyAuthChallenge(email, challenge)

		return authSession
	}
}
