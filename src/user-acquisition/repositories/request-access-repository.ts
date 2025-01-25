
import { putAccessRequest } from "../adapters/secondary/access-request-databse-adapter"
import { AccessRequest } from "../entity/access-request"


export async function requestAccessRepository(request: AccessRequest): Promise<void> {
	// use the adapter to call the database
	await putAccessRequest(request.toInputDto())
}