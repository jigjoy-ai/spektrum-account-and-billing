import { AccessRequestDto } from "src/user-acquisition/dto/access-request"
import { AccessRequest } from "src/user-acquisition/entity/access-request"
import { requestAccessRepository } from "src/user-acquisition/repositories/request-access-repository"

export async function requestAccessUseCase(request: AccessRequestDto): Promise<any> {
	const requestEntity = AccessRequest.create(request)

	await requestAccessRepository(requestEntity)
}
