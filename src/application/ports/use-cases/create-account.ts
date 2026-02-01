import { Account } from "@domain/account"

export interface CreateAccountUseCase {
	execute(email: string): Promise<Account>
}
