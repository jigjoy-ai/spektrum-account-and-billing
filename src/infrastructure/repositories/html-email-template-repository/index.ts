import { HtmlEmailTemplateRepository } from "./html-email-template-repository"
import { EmailTemplateRepository } from "@app/ports/repositories/email-template-repository"

export const templateRepository: EmailTemplateRepository = new HtmlEmailTemplateRepository()