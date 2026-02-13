import { AccountRepository } from "@app/ports/repositories/account-repository"
import { ChargeUseCase } from "@app/ports/use-cases/charge"

export class Charge implements ChargeUseCase {
	constructor(private readonly accountRepository: AccountRepository) {}

	async execute(accountId: string, providerCostUsd: number): Promise<number> {
		const account = await this.accountRepository.getById(accountId)
		if (!account) {
			throw new Error(`Account with id ${accountId} not found`)
		}

		const totalCostUsd = providerCostUsd * 5
		account.deductCredits(totalCostUsd)
		await this.accountRepository.save(account)

		return totalCostUsd
	}
}
