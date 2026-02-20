import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { EmailSender } from "@app/ports/services/email-sender"
import { SendMagicLinkChallengeUseCase } from "@app/ports/use-cases/send-magic-link-challenge"
import { LoginEmailParams, LoginEmailFactory } from "@domain/login-email-factory"
import { MagicLinkBuilder } from "@app/services/magic-link-builder"
import { Organization } from "@domain/organization"
import { OrganizationRepository } from "@app/ports/repositories/organization-repository"

export class SendMagicLinkChallenge implements SendMagicLinkChallengeUseCase {
	private readonly EXPIRATION_MINUTES: number = 5

	constructor(
		private readonly emailSender: EmailSender,
		private readonly identityManagementService: IdentityManagementService,
		private readonly organizationRepository: OrganizationRepository,
		private readonly fromAddress: string,
		private readonly destinationUrl: string,
	) {}

	async execute(email: string): Promise<void> {

		let user = await this.identityManagementService.get(email)

		// If the account does not exist, create it
		if (!user) {
			const freeCreditsUsd = 5.0
			user = await this.identityManagementService.create(email)
			const newOrganization = Organization.create(user, freeCreditsUsd)
			await this.organizationRepository.save(newOrganization)
			// TODO: Add user to organization
		}

		const ownerId = user.getId()
		// Token will be used to verify magic link
		const challengeToken = await this.identityManagementService.issueAuthChallenge(
			ownerId,
			this.EXPIRATION_MINUTES,
		)

		const loginLink = MagicLinkBuilder.create(this.destinationUrl, ownerId, challengeToken)

		// Create the email to send the magic link
		const loginEmailParams: LoginEmailParams = {
			recipient: ownerId,
			sender: this.fromAddress,
			loginLink: loginLink,
			expirationInMinutes: this.EXPIRATION_MINUTES,
		}

		const emailWithMagicLink = LoginEmailFactory.create(loginEmailParams)
		await this.emailSender.sendEmail(emailWithMagicLink)
	}
}
