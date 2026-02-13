import { AccountRepository } from "@app/ports/repositories/account-repository"
import { ChargeUseCase } from "@app/ports/use-cases/charge"

export class Charge implements ChargeUseCase {
	constructor(private readonly accountRepository: AccountRepository) {}

	async execute(accountId: string, amount: number): Promise<void> {
		const account = await this.accountRepository.getById(accountId)
		if (!account) {
			throw new Error(`Account with id ${accountId} not found`)
		}

		account.deductCredits(amount)
		await this.accountRepository.save(account)
	}
}
