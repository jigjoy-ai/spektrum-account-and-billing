import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { CognitoIdentityManagementService } from "@infra/services/cognito-identity-management/cognito-identity-management"

const USER_POOL_ID = process.env.USER_POOL_ID as string
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID as string

export const identityManagementService: IdentityManagementService = new CognitoIdentityManagementService(
	USER_POOL_ID,
	USER_POOL_CLIENT_ID,
)
