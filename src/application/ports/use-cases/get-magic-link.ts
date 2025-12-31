export interface GetMagicLinkPort {
	execute(email: string): Promise<void>
}