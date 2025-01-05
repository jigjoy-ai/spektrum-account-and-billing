import { FileDto, RefactorProjectDto, ReturnProjectDto } from "@dto/project"

export async function refactorProjectUseCase(refactorRequest: RefactorProjectDto): Promise<ReturnProjectDto> {
    const files: FileDto = {
        "/App.tsx": { code: "export default function App(){return <div>Hop</div>}" },
        "/Header.tsx": { code: "export default function Header(){return <h1>Header</h1>}" }
      }

	const project: ReturnProjectDto = {id:refactorRequest.id, files: files}

	return project
}
