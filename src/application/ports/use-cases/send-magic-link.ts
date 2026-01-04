export interface SendMagicLinkPort {
	execute(email: string): Promise<void>
}
