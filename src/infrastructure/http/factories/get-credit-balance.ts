import { GetCreditBalanceUseCase } from "@app/ports/use-cases/get-credit-balance"
import { Auth } from "@heksagon/app"
import { extractAuthData } from "@heksagon/http"
import { UserData } from "@jigjoy-ai/auth"
import { errorHandler, Responses } from "@jigjoy-ai/serverless-core"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

export function createGetCreditBalanceHandler(getCreditBalance: GetCreditBalanceUseCase) {
	return async function createGetCreditBalanceHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
		try {
			const auth: Auth<UserData> = extractAuthData(event.headers)
			const creditBalance = await getCreditBalance.execute(auth)
			return Responses._200({ creditBalance })
		} catch (error) {
			return errorHandler(error)
		}
	}
}
