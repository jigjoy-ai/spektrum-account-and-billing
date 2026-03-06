import { OrganizationRepository } from "@app/ports/repositories/organization-repository"
import { GetCreditBalanceUseCase } from "@app/ports/use-cases/get-credit-balance"
import { Auth } from "@heksagon/app"
import { UserData } from "@jigjoy-ai/auth"

export class GetCreditBalance implements GetCreditBalanceUseCase {
	constructor(private readonly organizationRepository: OrganizationRepository) {}

	async execute(auth: Auth<UserData>): Promise<number> {
		const organization = await this.organizationRepository.getById(auth.data.organizationId)
		if (!organization) {
			throw new Error("Organization not found")
		}
		return organization?.getRemainingCredits()
	}
}
