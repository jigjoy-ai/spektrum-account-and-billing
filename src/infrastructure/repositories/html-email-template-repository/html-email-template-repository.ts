import { EmailTemplateRepository } from "@app/ports/repositories/email-template-repository"
import { EmailTemplate } from "@domain/email-template"
import { templates } from "./templates"

export class HtmlEmailTemplateRepository implements EmailTemplateRepository {
    render(template: EmailTemplate): string {
        const html = this.load(template.getName())
        return this.interpolate(html, template.getProps())
    }
  
    private load(name: string): string {
        const html = templates[name]
        if (!html) {
            throw new Error(`Email template "${name}" not found`)
        }
        return html
    }
  
    private interpolate(html: string, props: Record<string, string>): string {
        return Object.entries(props).reduce(
            (result, [key, value]) => result.replace(new RegExp(`{{${key}}}`, 'g'), value),
            html
        )
    }
}