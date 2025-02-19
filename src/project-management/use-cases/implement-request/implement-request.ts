import { ChangeRequestDto } from "@dto/project"
import { buildProject } from "@utils/build"
import Team from "@utils/team/team"

export async function implementRequesttUseCase(changeRequest: ChangeRequestDto): Promise<any> {
	try {
		const newSourceCode = await Team.implement(changeRequest)

		console.log(`source code: ${newSourceCode}`)
		await buildProject({
			id: changeRequest.project.id,
			sourceCode: newSourceCode,
		})
		return newSourceCode
	} catch (error) {
		console.error("Error:", error)
	}
}
