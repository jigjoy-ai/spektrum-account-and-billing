import { OrganizationRepository } from "@app/ports/repositories/organization-repository"
import { ChargeUseCase } from "@app/ports/use-cases/charge"

export class Charge implements ChargeUseCase {
	constructor(private readonly organizationRepository: OrganizationRepository) {}

	async execute(organizationId: string, providerCostUsd: number): Promise<number> {
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
