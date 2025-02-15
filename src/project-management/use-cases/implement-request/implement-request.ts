import { ChangeRequestDto } from "@dto/project"
import Team from "@utils/team/team"
import { buildSourceCode } from "./webpack-compiler"

export async function implementRequesttUseCase(changeRequest: ChangeRequestDto): Promise<any> {
	try {
		
		//const newSourceCode = await Team.implement(changeRequest)
		await buildSourceCode(changeRequest.project.sourceCode, changeRequest.project.id)
		return changeRequest.project.sourceCode
	} catch (error) {
		console.error("Error:", error)
	}
}
