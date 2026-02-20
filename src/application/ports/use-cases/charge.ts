export interface ChargeUseCase {
	execute(organizationId: string, providerCostUsd: number): Promise<number>
}
