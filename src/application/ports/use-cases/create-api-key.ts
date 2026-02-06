export interface CreateApiKeyUseCase {
	execute(accountId: string, name: string): Promise<string>
}