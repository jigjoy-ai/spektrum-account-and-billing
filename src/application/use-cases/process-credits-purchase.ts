import { OrganizationRepository } from "@app/ports/repositories/organization-repository"
import { ProcessCreditsPurchaseParams, ProcessCreditsPurchaseUseCase } from "@app/ports/use-cases/process-credits-purchase"

export class ProcessCreditsPurchase implements ProcessCreditsPurchaseUseCase {

    constructor(private readonly organizationRepository: OrganizationRepository){ }

    async execute(params: ProcessCreditsPurchaseParams): Promise<void> {
        const { creditAmount, organizationId } = params

        const organization = await this.organizationRepository.getById(organizationId)

        if (!organization) {
            throw new Error("Organization not found")
        }

        organization.addCredits(creditAmount)
        await this.organizationRepository.save(organization)

    }

}