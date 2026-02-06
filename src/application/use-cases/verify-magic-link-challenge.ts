import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"
import { AuthSession } from "@domain/auth-session"
import { ApiKeyRepository } from "@app/ports/repositories/api-key-repository"
import { ApiKey } from "@domain/api-key"
import { AccountRepository } from "@app/ports/repositories/account-repository"

export class VerifyMagicLinkChallenge implements VerifyMagicLinkChallengeUseCase {
	constructor(private readonly identityManagementService: IdentityManagementService, private readonly accountRepository: AccountRepository, private readonly apiKeyRepository: ApiKeyRepository) {}

	async execute(email: string, challenge: string): Promise<AuthSession> {
		const user = await this.identityManagementService.get(email)

		if (!user) {
			throw new Error("User does not exist. Please create an account.")
		}

		const accessToken: string = await this.identityManagementService.verifyAuthChallenge(email, challenge)
		const account = await this.accountRepository.getByEmail(email)
		
		if (!account) {
			throw new Error("Account does not exist. Please create an account.")
		}
		const apiKeys: ApiKey[] = await this.apiKeyRepository.getActiveByAccountId(account.getId())

		return AuthSession.create(accessToken, account, apiKeys)
	}
}
