export interface ChargeUseCase {
	execute(accountId: string, amount: number): Promise<void>
}
