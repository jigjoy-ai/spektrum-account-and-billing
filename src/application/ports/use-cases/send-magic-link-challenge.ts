export interface SendMagicLinkChallengeUseCase {
	execute(email: string): Promise<void>
}
