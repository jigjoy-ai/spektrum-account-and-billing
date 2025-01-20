export type ChangeRequestDto = {
	id: string,
	project: ProjectDto,
	message: string
}

export type ProjectDto = {
    id?: string,
	sourceCode: SourceCode
}

export interface SourceCode {
	[filePath: string]: FileContentDto
}

export interface FileContentDto {
	code: string
}
