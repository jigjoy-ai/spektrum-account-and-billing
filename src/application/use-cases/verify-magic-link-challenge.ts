import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"
import { AuthSession } from "@domain/auth-session"
import { ApiKeyRepository } from "@app/ports/repositories/api-key-repository"
import { ApiKey } from "@domain/api-key"
import { OrganizationRepository } from "@app/ports/repositories/organization-repository"

export class VerifyMagicLinkChallenge implements VerifyMagicLinkChallengeUseCase {
	constructor(private readonly identityManagementService: IdentityManagementService, private readonly organizationRepository: OrganizationRepository, private readonly apiKeyRepository: ApiKeyRepository) {}

	async execute(email: string, challenge: string): Promise<AuthSession> {
		const user = await this.identityManagementService.get(email)

		if (!user) {
			throw new Error("User does not exist. Please create an account.")
		}

		const accessToken: string = await this.identityManagementService.verifyAuthChallenge(email, challenge)
		const organization = await this.organizationRepository.getByOwnerId(user.getId())
		
		if (!organization) {
			throw new Error("Organization does not exist. Please create an account.")
		}
		const apiKeys: ApiKey[] = await this.apiKeyRepository.getActiveByOrganizationId(organization.getId())

		return AuthSession.create(accessToken, email, organization, apiKeys)
	}
}
