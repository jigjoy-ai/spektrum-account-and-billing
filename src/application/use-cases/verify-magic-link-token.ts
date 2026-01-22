import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { VerifyMagicLinkTokenUseCase } from "@app/ports/use-cases/verify-magic-link-token"

export class VerifyMagicLinkToken implements VerifyMagicLinkTokenUseCase {
	constructor(private readonly identityManagementService: IdentityManagementService) {}

	async execute(email: string, token: string): Promise<void> {
        await this.identityManagementService.verifyAuthToken(email, token)
	}
}