import { TokenService } from "@app/ports/services/token-service"
import { MagicLink } from "@domain/magic-link"

export class MagicLinkService {
	private readonly EXPIRATION_MINUTES: number = 5

	constructor(
		private readonly tokenService: TokenService,
		private readonly destinationUrl: string) {}

	async createMagicLinkChallenge(userEmail: string): Promise<{ magicLink: MagicLink; authChallenge: string }> {

		const token = await this.tokenService.generateToken(userEmail, this.EXPIRATION_MINUTES)
		const urlSafeToken = this.tokenService.toUrlSafeToken(token)

		const loginLink = `${this.destinationUrl}?email=${userEmail}&token=${urlSafeToken}`

		const magicLink = new MagicLink(loginLink, this.EXPIRATION_MINUTES)
		return {
			magicLink: magicLink,
			authChallenge: token,
		}
	}
}
