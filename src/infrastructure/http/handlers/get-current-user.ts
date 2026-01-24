import { createGetCurrentUserHandler } from "@infra/http/factories/get-current-user"
import { getCurrentUserUseCase } from "@infra/dependencies"

export const handler = createGetCurrentUserHandler(getCurrentUserUseCase)
