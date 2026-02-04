import { AccountRepository } from "@app/ports/repositories/account-repository"
import { AccountService } from "@app/ports/services/account-service"
import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { Account } from "@domain/account"

export class DefaultAccountService implements AccountService {
	constructor(
        private readonly accountRepository: AccountRepository, 
        private readonly identityManagementService: IdentityManagementService) 
    {}

	async createAccount(userEmail: string, freeCreditsUsd: number): Promise<Account> {
		

        const user = await this.identityManagementService.create(userEmail)
		const account = Account.create(userEmail, freeCreditsUsd)
        account.addUser(user)
		return await this.accountRepository.save(account)
	}

    async getAccount(userEmail: string): Promise<Account | null> {
        return await this.accountRepository.getByEmail(userEmail)
    }
}