export type RefactorProjectDto = {
    projectId: string,
    message: string
}

export type ReturnProjectDto = {
    files: Map<string, CodeDto>
}

export type CodeDto = {
    code: string
}