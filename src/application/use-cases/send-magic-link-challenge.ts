import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { EmailSender } from "@app/ports/services/email-sender"
import { SendMagicLinkChallengeParams, SendMagicLinkChallengeUseCase } from "@app/ports/use-cases/send-magic-link-challenge"
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

	async execute(params: SendMagicLinkChallengeParams): Promise<void> {

		const { email } = params

		const userExists = await this.identityManagementService.exists(email)

		// If the account does not exist, create it
		if (!userExists) {
			const freeCreditsUsd = 5.0
			const user = await this.identityManagementService.create(email)
			const newOrganization = Organization.create(user, freeCreditsUsd)
			await this.organizationRepository.save(newOrganization)
		}

		// Token will be used to verify magic link
		const challengeToken = await this.identityManagementService.issueAuthChallenge(
			email,
			this.EXPIRATION_MINUTES,
		)

		const loginLink = MagicLinkBuilder.create(this.destinationUrl, email, challengeToken)

		// Create the email to send the magic link
		const loginEmailParams: LoginEmailParams = {
			recipient: email,
			sender: this.fromAddress,
			loginLink: loginLink,
			expirationInMinutes: this.EXPIRATION_MINUTES,
		}

		const emailWithMagicLink = LoginEmailFactory.create(loginEmailParams)
		await this.emailSender.sendEmail(emailWithMagicLink)
	}
}
