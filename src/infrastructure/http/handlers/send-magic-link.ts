import { createSendMagicLinkHandler } from "@infra/http/factories/send-magic-link"
import { sendMagicLinkUseCase } from "@infra/dependencies"

export const handler = createSendMagicLinkHandler(sendMagicLinkUseCase)
