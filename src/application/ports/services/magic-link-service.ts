import { MagicLink } from "@domain/magic-link"

export type MagicLinkChallenge = {
	magicLink: MagicLink
	authChallenge: string
}

export interface MagicLinkService {
	createMagicLinkChallenge(userEmail: string): Promise<MagicLinkChallenge>
}
