export type RefactorProjectDto = {
	id: string
	message: string
}

export type ProjectDto = {
    id?: string,
	files: FileDto
}

export interface FileDto {
	[filePath: string]: FileContentDto
}

export interface FileContentDto {
	code: string
}
