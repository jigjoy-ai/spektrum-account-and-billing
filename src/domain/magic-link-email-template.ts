import { MagicLink } from "./magic-link"

export class MagicLinkEmailFactory {
	

	static createEmailBody(magicLink: MagicLink): string {
		return `<html><body><p>This is your one-time sign in link (it will expire in ${magicLink.getExpiration()} mins):</p>
				<a href="${magicLink.getLoginLink()}" target="_blank">link</a></body></html>`
	}
}
