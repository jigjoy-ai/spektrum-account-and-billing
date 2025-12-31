import { EmailSenderPort } from "@app/ports/services/email-sender"
import { GetMagicLinkPort } from "@app/ports/use-cases/get-magic-link"
import { AdminCreateUserCommand, AdminGetUserCommand, AdminUpdateUserAttributesCommand, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider"
import { Email } from "@domain/email"
import { MagicLink } from "@domain/magic-link"
import { MagicLinkEmailFactory } from "@domain/magic-link-email-template"
import { encrypt } from "@infra/encription/encription"
import { escape } from "querystring"

const cognito = new CognitoIdentityProviderClient()

const { USER_POOL_ID, FROM_ADDRESS, FRONTEND_APP_URL } = process.env
const ONE_MIN = 60 * 1000
const LINK_EXPIRATION_MINS = 5

export class GetMagicLinkUseCase implements GetMagicLinkPort {

	constructor(private readonly emailSender: EmailSenderPort) {}

	async execute(recipient: string): Promise<void> {
		try {
			const getUserCommand = new AdminGetUserCommand({
				Username: recipient,
				UserPoolId: USER_POOL_ID as string,
			})
			await cognito.send(getUserCommand)
		} catch (error: any) {
			switch (error.name) {
				case "UserNotFoundException":
					const createUserCommand = new AdminCreateUserCommand({
						Username: recipient,
						UserPoolId: USER_POOL_ID as string,
						MessageAction: "SUPPRESS",
					})
					await cognito.send(createUserCommand)
					break
			}
		}

		// only send the magic link on the first attempt
		const now = new Date()
		const expiration = new Date(now.getTime() + ONE_MIN * LINK_EXPIRATION_MINS)
		const payload = {
			recipient,
			expiration: expiration.toJSON(),
		}
		const tokenRaw = await encrypt(JSON.stringify(payload))
		const tokenB64 = Buffer.from(tokenRaw).toString("base64")
		const token = escape(tokenB64)

		const updateAttributesCommand = new AdminUpdateUserAttributesCommand({
			UserPoolId: USER_POOL_ID as string,
			Username: recipient,
			UserAttributes: [
				{
					Name: "custom:authChallenge",
					Value: tokenB64,
				},
			],
		})
		await cognito.send(updateAttributesCommand)

		
		const loginLink = `${FRONTEND_APP_URL}/workspace?email=${recipient}&token=${token}`

		const magicLink = new MagicLink(loginLink, LINK_EXPIRATION_MINS)
		const emailBody = MagicLinkEmailFactory.createEmailBody(magicLink)
		const emailSubject = "JigJoy Login Link"
		const emailSender = FROM_ADDRESS as string
		const email = new Email(recipient, emailSender, emailSubject, emailBody)

		await this.emailSender.sendEmail(email)
	}
}