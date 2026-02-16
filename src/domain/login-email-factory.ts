import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { Email } from "@domain/email"
import { MagicLinkEmail } from "@infra/email-templates/magic-link-email"

export type LoginEmailParams = {
	recipient: string
	sender: string
	loginLink: string
	expirationInMinutes: number
}

export class LoginEmailFactory {
	static create(params: LoginEmailParams): Email {
		const subject = "JigJoy Login Link"

		const body =
			"<!DOCTYPE html>" +
			renderToStaticMarkup(
				React.createElement(MagicLinkEmail, {
					loginLink: params.loginLink,
					expirationInMinutes: params.expirationInMinutes,
				}),
			)

		return new Email(params.recipient, params.sender, subject, body)
	}
}
