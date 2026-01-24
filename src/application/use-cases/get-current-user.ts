import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { GetCurrentUserUseCase } from "@app/ports/use-cases/get-current-user"
import { CurrentUser } from "@domain/current-user"

export class GetCurrentUser implements GetCurrentUserUseCase {
	constructor(private readonly identityManagementService: IdentityManagementService) {}

	async execute(accessToken: string): Promise<CurrentUser> {
		const currentUser: CurrentUser = await this.identityManagementService.getCurrentUserFromAccessToken(accessToken)
		return currentUser
	}
}