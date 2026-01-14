export interface SendMagicLinkUseCase {
	execute(email: string): Promise<void>
}
