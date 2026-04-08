import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { EmailSender } from "@app/ports/services/email-sender"
import {
	SendMagicLinkChallengeParams,
	SendMagicLinkChallengeUseCase,
} from "@app/ports/use-cases/send-magic-link-challenge"
import { MagicLinkBuilder } from "@app/services/magic-link-builder"
import { Organization } from "@domain/organization"
import { OrganizationRepository } from "@app/ports/repositories/organization-repository"
import { EmailTemplateRepository } from "@app/ports/repositories/email-template-repository"
import { EmailTemplate } from "@domain/email-template"
import { Email } from "@domain/email"

export class SendMagicLinkChallenge implements SendMagicLinkChallengeUseCase {
	private readonly EXPIRATION_MINUTES: number = 5

	constructor(
		private readonly emailSender: EmailSender,
		private readonly identityManagementService: IdentityManagementService,
		private readonly organizationRepository: OrganizationRepository,
		private readonly fromAddress: string,
		private readonly platformUrl: string,
		private readonly emailTemplateRepository: EmailTemplateRepository,
	) {}

	async execute(params: SendMagicLinkChallengeParams): Promise<void> {
		const { email } = params

		const userExists = await this.identityManagementService.exists(email)

		// If the account does not exist, create it and send welcome email
		if (!userExists) {
			const freeCreditsUsd = 5.0
			const user = await this.identityManagementService.create(email)
			const newOrganization = Organization.create(user, freeCreditsUsd)
			await this.organizationRepository.save(newOrganization)

			const challengeToken = await this.identityManagementService.issueAuthChallenge(
				email,
				this.EXPIRATION_MINUTES,
			)

			// welcome mail will send user to onboarding page if params.onboarding is true, otherwise it will send user to workspace page
			const page = params.sdkOnboarding ? "onboarding" : "workspace"
			const loginLink = MagicLinkBuilder.create(this.platformUrl, page, email, challengeToken)

			const template = new EmailTemplate("welcome", {
				loginLink: loginLink,
			})
			const html = this.emailTemplateRepository.render(template)

			const emailToSend = new Email(email, this.fromAddress, "Welcome to JigJoy", html)

			await this.emailSender.sendEmail(emailToSend)
		} else {
			const challengeToken = await this.identityManagementService.issueAuthChallenge(
				email,
				this.EXPIRATION_MINUTES,
			)

			// login mail will send user to workspace page
			const loginLink = MagicLinkBuilder.create(this.platformUrl, "workspace", email, challengeToken)

			const template = new EmailTemplate("login", {
				loginLink: loginLink,
				expirationInMinutes: this.EXPIRATION_MINUTES.toString(),
			})
			const html = this.emailTemplateRepository.render(template)

			const emailToSend = new Email(email, this.fromAddress, "JigJoy Login Link", html)

			await this.emailSender.sendEmail(emailToSend)
		}
	}
}
