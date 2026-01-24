import { CurrentUser } from "@domain/current-user"

export interface GetCurrentUserUseCase {
	execute(accessToken: string): Promise<CurrentUser>
}