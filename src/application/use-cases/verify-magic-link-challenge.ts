import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"

export class VerifyMagicLinkChallenge implements VerifyMagicLinkChallengeUseCase {
	constructor(private readonly identityManagementService: IdentityManagementService) {}

	async execute(email: string, challenge: string): Promise<void> {
        await this.identityManagementService.verifyAuthChallenge(email, challenge)
	}
}