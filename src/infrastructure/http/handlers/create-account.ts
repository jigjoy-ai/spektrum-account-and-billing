import { createCreateAccountHandler } from "@infra/http/factories/create-account"
import { createAccountUseCase } from "@infra/dependencies"

export const handler = createCreateAccountHandler(createAccountUseCase)
