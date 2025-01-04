import { CodeDto, RefactorProjectDto, ReturnProjectDto } from "@dto/project"

export async function refactorProjectUseCase(refactorRequest: RefactorProjectDto): Promise<ReturnProjectDto> {
	const files = new Map<string, CodeDto>()
	files.set("./App.tsx", {
		code: "export default function App(){return <div>Hop</div>}",
	})
	const project: ReturnProjectDto = { files: files }

	return project
}
