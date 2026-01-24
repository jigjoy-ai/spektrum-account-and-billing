import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"

export class VerifyMagicLinkChallenge implements VerifyMagicLinkChallengeUseCase {
	constructor(private readonly identityManagementService: IdentityManagementService) {}

	async execute(email: string, challenge: string): Promise<string> {

		const userExists = await this.identityManagementService.hasUser(email)

		// If the user does not exist, create user
		if (!userExists) {
			throw new Error("User does not exist. Please request a new magic link.")
		}

        const accessToken = await this.identityManagementService.verifyAuthChallenge(email, challenge)

        return accessToken
	}
}