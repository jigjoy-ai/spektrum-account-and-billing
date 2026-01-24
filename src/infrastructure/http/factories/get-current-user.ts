import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { errorHandler, Responses, ValidationError } from "@jigjoy-io/serverless-core"
import { GetCurrentUserUseCase } from "@app/ports/use-cases/get-current-user"

function getCookie(headers: Record<string, string | undefined>, name: string) {
    const raw = headers.cookie ?? headers.Cookie
    if (!raw) return null
    const part = raw.split(";").map(s => s.trim()).find(x => x.startsWith(name + "="))
    return part ? decodeURIComponent(part.slice(name.length + 1)) : null
}

export function createGetCurrentUserHandler(getCurrentUserUseCase: GetCurrentUserUseCase) {
	return async function createGetCurrentUserHandler({ headers }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
		try {
			const accessToken = getCookie(headers, "accessToken")
			if (!accessToken) 
                throw new ValidationError("No access token")

			const currentUser = await getCurrentUserUseCase.execute(accessToken)
			return Responses._200({ userData: currentUser })
		} catch (error) {
			return errorHandler(error)
		}
	}
}
