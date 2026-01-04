import { MagicLink } from "@domain/magic-link"
import { Email } from "@domain/email"

export type CreateMagicLinkEmailParams = {
	recipient: string
	sender: string
	magicLink: MagicLink
}

export class MagicLinkEmailFactory {
	static create(params: CreateMagicLinkEmailParams): Email {
		const subject = "JigJoy Login Link"

		const body = `
			<html>
				<body>
					<p>This is your one-time sign in link (it will expire in ${params.magicLink.getExpiration()} mins):</p>
					<a href="${params.magicLink.getLoginLink()}" target="_blank">Click here to login</a>
				</body>
			</html>
			`.trim()

		return new Email(params.recipient, params.sender, subject, body)
	}
}
