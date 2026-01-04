import { MagicLink } from "@domain/magic-link"

export type MagicLinkChallenge = {
	magicLink: MagicLink
	authChallenge: string
}

export interface MagicLinkServicePort {
	createMagicLinkChallenge(userEmail: string): Promise<MagicLinkChallenge>
}
