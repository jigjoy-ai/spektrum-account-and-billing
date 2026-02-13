export interface ChargeUseCase {
	execute(accountId: string, providerCostUsd: number): Promise<number>
}
