import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { VerifyAuthChallengeUseCase } from "@app/ports/use-cases/verify-auth-challenge"

export class VerifyMagicLinkChallenge implements VerifyAuthChallengeUseCase {
	constructor(private readonly identityManagementService: IdentityManagementService) {}

	async execute(email: string, challenge: string): Promise<void> {
        await this.identityManagementService.verifyAuthChallenge(email, challenge)
	}
}