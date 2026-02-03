import { SendMagicLinkChallenge } from "@app/use-cases/send-magic-link-challenge"
import { SendgridEmailSender } from "./services/sendgrid-email-sender/sendgrid-email-sender"
import { SendMagicLinkChallengeUseCase } from "@app/ports/use-cases/send-magic-link-challenge"
import { CognitoIdentityManagementService } from "./services/cognito-identity-management/cognito-identity-management"
import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { VerifyMagicLinkChallengeUseCase } from "@app/ports/use-cases/verify-magic-link-challenge"
import { VerifyMagicLinkChallenge } from "@app/use-cases/verify-magic-link-challenge"
import { CreateAccount } from "@app/use-cases/create-account"
import { AccountRepository } from "@app/ports/repositories/account-repository"
import { CreateAccountUseCase } from "@app/ports/use-cases/create-account"
import { DynamoDBAccountRepository } from "./repositories/dynamo-db-account-repository"

const sendgridEmailSender = new SendgridEmailSender()

const USER_POOL_ID = process.env.USER_POOL_ID as string
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID as string

const identityManagementService: IdentityManagementService = new CognitoIdentityManagementService(
	USER_POOL_ID,
	USER_POOL_CLIENT_ID,
)

const DESTINATION_URL = process.env.DESTINATION_URL as string
const FROM_ADDRESS = process.env.FROM_ADDRESS as string

export const sendMagicLinkChallengeUseCase: SendMagicLinkChallengeUseCase = new SendMagicLinkChallenge(
	sendgridEmailSender,
	identityManagementService,
	FROM_ADDRESS,
	DESTINATION_URL,
)

export const verifyMagicLinkChallengeUseCase: VerifyMagicLinkChallengeUseCase = new VerifyMagicLinkChallenge(
	identityManagementService,
)

const accountRepository: AccountRepository = new DynamoDBAccountRepository()

export const createAccountUseCase: CreateAccountUseCase = new CreateAccount(
	accountRepository,
	identityManagementService,
)
