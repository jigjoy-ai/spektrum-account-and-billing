export interface CreateAccountUseCase {
	execute(email: string): Promise<void>
}
