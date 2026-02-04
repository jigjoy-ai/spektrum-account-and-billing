import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"
import { AccountService } from "@app/ports/services/account-service"
import { AuthSession } from "@domain/auth-session"

export class VerifyMagicLinkChallenge implements VerifyMagicLinkChallengeUseCase {
	constructor(private readonly identityManagementService: IdentityManagementService, private readonly accountService: AccountService) {}

	async execute(email: string, challenge: string): Promise<AuthSession> {
		const user = await this.identityManagementService.get(email)

		if (!user) {
			throw new Error("User does not exist. Please create an account.")
		}

		const accessToken: string = await this.identityManagementService.verifyAuthChallenge(email, challenge)
		const account = await this.accountService.getAccount(email)

		if (!account) {
			throw new Error("Account does not exist. Please create an account.")
		}

		return AuthSession.create(accessToken, account)
	}
}
