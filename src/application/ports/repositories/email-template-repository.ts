import { EmailTemplate } from '@domain/email-template'

export interface EmailTemplateRepository {
    render(template: EmailTemplate): string
}