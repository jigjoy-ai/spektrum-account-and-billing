export interface VerifyMagicLinkTokenUseCase {
	execute(email: string, token: string, session: string): Promise<void>
}