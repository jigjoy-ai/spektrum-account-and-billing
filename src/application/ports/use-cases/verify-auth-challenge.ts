export interface VerifyAuthChallengeUseCase {
	execute(email: string, token: string, session: string): Promise<void>
}