import { AccountStorePort } from "@app/ports/repositories/account-store"
import { EmailSenderPort } from "@app/ports/services/email-sender"
import { SendMagicLinkUseCase } from "@app/ports/use-cases/send-magic-link"
import { CreateMagicLinkEmailParams, MagicLinkEmailFactory } from "@domain/magic-link-email-factory"
import { Account } from "@domain/account"
import { MagicLinkServicePort } from "@app/ports/services/magic-link-service"

export class SendMagicLink implements SendMagicLinkUseCase {
	fromAddress: string
	constructor(
		private readonly emailSender: EmailSenderPort,
		private readonly accountStore: AccountStorePort,
		private readonly magicLinkService: MagicLinkServicePort,
	) {
		const FROM_ADDRESS = process.env.FROM_ADDRESS as string
		if (!FROM_ADDRESS) {
			throw new Error("FROM_ADDRESS is not set")
		}
		this.fromAddress = FROM_ADDRESS
	}

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
