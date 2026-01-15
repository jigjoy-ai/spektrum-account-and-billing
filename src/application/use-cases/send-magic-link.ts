import { AccountStore } from "@app/ports/repositories/account-store"
import { EmailSender } from "@app/ports/services/email-sender"
import { SendMagicLinkUseCase } from "@app/ports/use-cases/send-magic-link"
import { CreateMagicLinkEmailParams, MagicLinkEmailFactory } from "@domain/magic-link-email-factory"
import { MagicLinkService } from "@app/services/magic-link-service"
import { Account } from "@domain/account"

export class SendMagicLink implements SendMagicLinkUseCase {
	
	constructor(
		private readonly emailSender: EmailSender,
		private readonly accountStore: AccountStore,
		private readonly magicLinkService: MagicLinkService,
		private readonly fromAddress: string,
	) {}
	

	async execute(userEmail: string): Promise<void> {
		const account = await this.accountStore.findByEmail(userEmail)

		// If the account does not exist, create it
		if (!account) {
			const newAccount = Account.create(userEmail)
			await this.accountStore.create(newAccount)
		}

		// Create a new magic link challenge
		const { magicLink, authChallenge } = await this.magicLinkService.createMagicLinkChallenge(userEmail)

		await this.accountStore.setAuthChallenge(userEmail, authChallenge)

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
