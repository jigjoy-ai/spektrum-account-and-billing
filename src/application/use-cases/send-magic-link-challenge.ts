import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { EmailSender } from "@app/ports/services/email-sender"
import { SendMagicLinkChallengeUseCase } from "@app/ports/use-cases/send-magic-link-challenge"
import { LoginEmailParams, LoginEmailFactory } from "@domain/login-email-factory"
import { MagicLinkBuilder } from "@app/services/magic-link-builder"

export class SendMagicLinkChallenge implements SendMagicLinkChallengeUseCase {
	private readonly EXPIRATION_MINUTES: number = 5

	constructor(
		private readonly emailSender: EmailSender,
		private readonly identityManagementService: IdentityManagementService,
		private readonly fromAddress: string,
		private readonly destinationUrl: string,
	) {}

	async execute(userEmail: string): Promise<void> {
		const userExists = await this.identityManagementService.hasUser(userEmail)

		// If the account does not exist, create it
		if (!userExists) {
			await this.identityManagementService.createUser(userEmail)
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
