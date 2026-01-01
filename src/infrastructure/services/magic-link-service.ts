import { MagicLinkServicePort } from "@app/ports/services/magic-link-service"
import { MagicLink } from "@domain/magic-link"
import { encrypt } from "@infra/encription/encription"

const DESTINATION_URL = process.env.DESTINATION_URL as string
if(!DESTINATION_URL) {
	throw new Error("DESTINATION_URL is not set")
}

export class MagicLinkService implements MagicLinkServicePort {

    private readonly EXPIRATION_MINUTES: number = 5
    private readonly ONE_MINUTE_IN_MS: number = 60 * 1000

    constructor() {}

    async createMagicLinkChallenge(userEmail: string): Promise<{ magicLink: MagicLink; authChallenge: string }> {
        const now = new Date()
        const EXPIRATION_IN_MS = this.EXPIRATION_MINUTES * this.ONE_MINUTE_IN_MS
        const expiresAt = new Date(now.getTime() + EXPIRATION_IN_MS)
    
        const payload = {
          userEmail,
          expiration: expiresAt.toJSON(),
        }
    
        const tokenRaw = await encrypt(JSON.stringify(payload))
        const tokenB64 = Buffer.from(tokenRaw).toString("base64")
    
        const urlSafeToken = this.toUrlSafeBase64(tokenB64)

        const url = new URL(DESTINATION_URL)
        url.searchParams.set("email", userEmail)
        url.searchParams.set("token", urlSafeToken)
        
        const magicLink = new MagicLink(url.toString(), this.EXPIRATION_MINUTES)
        return {
            magicLink: magicLink,
            authChallenge: tokenB64
          }
    }

    private toUrlSafeBase64(b64: string): string {
        return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
    }


}