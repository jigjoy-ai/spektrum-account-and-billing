export class MagicLinkBuilder {
	static create(platformUrl: string, page: string, userEmail: string, challengeToken: string): string {
		const urlSafeEmail = encodeURIComponent(userEmail)
		const urlSafeToken = encodeURIComponent(challengeToken)
		const loginLink = `${platformUrl}/${page}?email=${urlSafeEmail}&token=${urlSafeToken}`

		return loginLink
	}
}
