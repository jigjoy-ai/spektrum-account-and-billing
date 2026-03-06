import { OrganizationRepository } from "@app/ports/repositories/organization-repository"
import { ChargeParams, ChargeUseCase } from "@app/ports/use-cases/charge"
import { Auth } from "@heksagon/app"
import { UserData } from "@jigjoy-ai/auth"

export class Charge implements ChargeUseCase {
	constructor(private readonly organizationRepository: OrganizationRepository) {}

	async execute(auth: Auth<UserData>, params: ChargeParams): Promise<number> {

		console.log(`Auth data: ${JSON.stringify(auth.data)}`)
		
		const { providerCostUsd } = params
		const organizationId = auth.data.organizationId

		const organization = await this.organizationRepository.getById(organizationId)
		if (!organization) {
			throw new Error(`Organization with id ${organizationId} not found`)
		}

		const totalCostUsd = providerCostUsd * 5
		organization.deductCredits(totalCostUsd)
		await this.organizationRepository.save(organization)

		return totalCostUsd
	}
}
