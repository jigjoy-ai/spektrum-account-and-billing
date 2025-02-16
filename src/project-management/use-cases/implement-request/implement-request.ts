import { ChangeRequestDto } from "@dto/project"
import Team from "@utils/team/team"

export async function implementRequesttUseCase(changeRequest: ChangeRequestDto): Promise<any> {
	try {
		return await Team.implement(changeRequest)
	} catch (error) {
		console.error("Error:", error)
	}
}
