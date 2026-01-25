import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { errorHandler, Responses, ValidationError } from "@jigjoy-io/serverless-core"
import { GetCurrentUserUseCase } from "@app/ports/use-cases/get-current-user"

function getBearerToken(headers: Record<string, string | undefined>): string | null {
    const authorization = headers.authorization ?? headers.Authorization
    if (!authorization) return null
    
    const parts = authorization.trim().split(" ")
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return null
    }
    
    return parts[1]
}

export function createGetCurrentUserHandler(getCurrentUserUseCase: GetCurrentUserUseCase) {
	return async function createGetCurrentUserHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
		try {
			const accessToken = getBearerToken(event.headers)
			if (!accessToken) 
                throw new ValidationError("No access token")

			const currentUser = await getCurrentUserUseCase.execute(accessToken)
			return Responses._200({ userData: currentUser })
		} catch (error) {
			return errorHandler(error)
		}
	}
}
