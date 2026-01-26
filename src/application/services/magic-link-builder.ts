export class MagicLinkBuilder {
	static create(destinationUrl: string, userEmail: string, challengeToken: string): string {
		const urlSafeEmail = encodeURIComponent(userEmail)
		const urlSafeToken = encodeURIComponent(challengeToken)
		const loginLink = `${destinationUrl}?email=${urlSafeEmail}&token=${urlSafeToken}`

		return loginLink
	}
}
