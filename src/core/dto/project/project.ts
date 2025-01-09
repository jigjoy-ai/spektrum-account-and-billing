export type ChangeRequestDto = {
	id: string,
	project: ProjectDto,
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
