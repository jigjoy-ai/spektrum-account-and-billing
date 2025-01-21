import { ChangeRequestDto } from "@dto/project"
import Team from "@utils/team/team"

export async function refactorProjectUseCase(changeRequest: ChangeRequestDto): Promise<any> {
	try {

		const newSourceCode = await Team.implement(changeRequest)

		return newSourceCode
	} catch (error) {
		console.error("Error:", error)
	}
}
