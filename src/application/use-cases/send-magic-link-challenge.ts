import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { EmailSender } from "@app/ports/services/email-sender"
import { SendMagicLinkChallengeUseCase } from "@app/ports/use-cases/send-magic-link-challenge"
import { LoginEmailParams, LoginEmailFactory } from "@domain/login-email-factory"
import { MagicLinkBuilder } from "@app/services/magic-link-builder"
import { AccountService } from "@app/ports/services/account-service"

export class SendMagicLinkChallenge implements SendMagicLinkChallengeUseCase {
	private readonly EXPIRATION_MINUTES: number = 5

	constructor(
		private readonly emailSender: EmailSender,
		private readonly identityManagementService: IdentityManagementService,
		private readonly accountService: AccountService,
		private readonly fromAddress: string,
		private readonly destinationUrl: string,
	) {}

	async execute(userEmail: string): Promise<void> {
		const account = await this.accountService.getAccount(userEmail)

		// If the account does not exist, create it
		if (!account) {
			await this.accountService.createAccount(userEmail, 5.0)
		}

		// Token will be used to verify magic link
		const challengeToken = await this.identityManagementService.issueAuthChallenge(
			userEmail,
			this.EXPIRATION_MINUTES,
		)

		const loginLink = MagicLinkBuilder.create(this.destinationUrl, userEmail, challengeToken)

		// Create the email to send the magic link
		const loginEmailParams: LoginEmailParams = {
			recipient: userEmail,
			sender: this.fromAddress,
			loginLink: loginLink,
			expirationInMinutes: this.EXPIRATION_MINUTES,
		}

		const emailWithMagicLink = LoginEmailFactory.create(loginEmailParams)
		await this.emailSender.sendEmail(emailWithMagicLink)
	}
}
