import { AccountRepository } from "@app/ports/repositories/account-repository"
import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { CreateAccountUseCase } from "@app/ports/use-cases/create-account"
import { Account } from "@domain/account"

export class CreateAccount implements CreateAccountUseCase {
	constructor(
		private readonly accountRepository: AccountRepository,
		private readonly identityManagementService: IdentityManagementService,
	) {}

	async execute(email: string): Promise<void> {
		const accountExists = await this.accountRepository.exists(email)

		if (accountExists) {
			throw new Error("Account already exists")
		}

		const user = await this.identityManagementService.create(email)

		const freeCreditsUsd = 5.0
		const account = Account.create(email, user, freeCreditsUsd)

		await this.accountRepository.save(account)
	}
}
