import { AccountStorePort } from "@app/ports/repositories/account-store"
import { EmailSenderPort } from "@app/ports/services/email-sender"
import { GetMagicLinkPort } from "@app/ports/use-cases/get-magic-link"
import { Email } from "@domain/email"
import { MagicLink } from "@domain/magic-link"
import { MagicLinkEmailFactory } from "@domain/magic-link-email-template"
import { Account } from "@domain/account"
import { encrypt } from "@infra/encription/encription"
import { escape } from "querystring"


const { FROM_ADDRESS, FRONTEND_APP_URL } = process.env
const ONE_MIN = 60 * 1000
const LINK_EXPIRATION_MINS = 5

export class GetMagicLinkUseCase implements GetMagicLinkPort {

	constructor(private readonly emailSender: EmailSenderPort, private readonly accountStore: AccountStorePort) {}

	async execute(userEmail: string): Promise<void> {

		const account = await this.accountStore.findByEmail(userEmail)
		
		if(!account){
			const newAccount = Account.create(userEmail)
			await this.accountStore.create(newAccount)
		}

		// only send the magic link on the first attempt
		const now = new Date()
		const expiration = new Date(now.getTime() + ONE_MIN * LINK_EXPIRATION_MINS)
		const payload = {
			userEmail,
			expiration: expiration.toJSON(),
		}
		const tokenRaw = await encrypt(JSON.stringify(payload))
		const tokenB64 = Buffer.from(tokenRaw).toString("base64")
		const token = escape(tokenB64)

		await this.accountStore.setAuthChallenge(userEmail, tokenB64)

		
		const loginLink = `${FRONTEND_APP_URL}/workspace?email=${userEmail}&token=${token}`

		const emailSender = FROM_ADDRESS as string
		const magicLink = new MagicLink(loginLink, LINK_EXPIRATION_MINS)


		const email: Email = MagicLinkEmailFactory.create({recipient: userEmail, sender: emailSender, magicLink: magicLink})
		await this.emailSender.sendEmail(email)
	}
}