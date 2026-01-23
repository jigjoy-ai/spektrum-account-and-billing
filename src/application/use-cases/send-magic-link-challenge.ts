import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { EmailSender } from "@app/ports/services/email-sender"
import { SendMagicLinkChallengeUseCase } from "@app/ports/use-cases/send-magic-link-challenge"
import { CreateMagicLinkEmailParams, MagicLinkEmailFactory } from "@domain/magic-link-email-factory"
import { MagicLinkService } from "@app/services/magic-link-service"

export class SendMagicLinkChallenge implements SendMagicLinkChallengeUseCase {
	
	constructor(
		private readonly emailSender: EmailSender,
		private readonly identityManagementService: IdentityManagementService,
		private readonly magicLinkService: MagicLinkService,
		private readonly fromAddress: string,
	) {}
	

	async execute(userEmail: string): Promise<void> {
		const userExists = await this.identityManagementService.hasUser(userEmail)

		// If the account does not exist, create it
		if (!userExists) {
			await this.identityManagementService.createUser(userEmail)
		}

		// Create a new magic link challenge
		const { magicLink, authChallenge } = await this.magicLinkService.createMagicLinkChallenge(userEmail)

		// Token will be used to verify magic link
		await this.identityManagementService.setAuthChallenge(userEmail, authChallenge)

		// Create the email to send the magic link
		const magicLinkEmailParams: CreateMagicLinkEmailParams = {
			recipient: userEmail,
			sender: this.fromAddress,
			magicLink: magicLink,
		}

		const email = MagicLinkEmailFactory.create(magicLinkEmailParams)
		await this.emailSender.sendEmail(email)
	}
}
