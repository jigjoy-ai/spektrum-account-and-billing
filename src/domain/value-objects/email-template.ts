class EmailTemplate {
	getSubject(): string {
		return "JigJoy Login Link"
	}

	getBody(magicLink: string, timeoutMins: number): string {
		return `<html><body><p>This is your one-time sign in link (it will expire in ${timeoutMins} mins):</p>
				<a href="${magicLink}" target="_blank">link</a></body></html>`
	}
}

export default EmailTemplate
