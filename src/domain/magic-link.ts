export class MagicLink {
	private readonly loginLink: string
	private readonly expiration: number

	constructor(loginLink: string, expiration: number) {
		this.loginLink = loginLink
		this.expiration = expiration
	}

	getLoginLink(): string {
		return this.loginLink
	}

	getExpiration(): number {
		return this.expiration
	}
}
