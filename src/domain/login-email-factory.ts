import { Email } from "@domain/email"

export type LoginEmailParams = {
	recipient: string
	sender: string
	loginLink: string
	expirationInMinutes: number
}

export class LoginEmailFactory {
	static create(params: LoginEmailParams): Email {
		const subject = "JigJoy Login Link"

		const body = `
			<html>
				<body>
					<p>This is your one-time sign in link (it will expire in ${params.expirationInMinutes} mins):</p>
					<a href="${params.loginLink}" target="_blank">Click here to login</a>
				</body>
			</html>
			`.trim()

		return new Email(params.recipient, params.sender, subject, body)
	}
}
