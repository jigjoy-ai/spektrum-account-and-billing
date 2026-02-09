import { AccountRepository } from "@app/ports/repositories/account-repository"
import { ProcessCreditsPurchaseUseCase } from "@app/ports/use-cases/process-credits-purchase"

export class ProcessCreditsPurchase implements ProcessCreditsPurchaseUseCase {

    constructor(private readonly accountRepository: AccountRepository){ }

    async execute(creditAmount: number, email: string, occuredAt: string): Promise<void> {
        const account = await this.accountRepository.getByEmail(email)

        if (!account) {
            throw new Error("Account not found")
        }

        account.addCredits(creditAmount)
        await this.accountRepository.save(account)

    }

}