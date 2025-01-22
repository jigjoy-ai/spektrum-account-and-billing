import { z } from "zod"

// FileContentDto Schema
const FileContentDtoSchema = z.object({
	code: z.string().describe("The code content of the file"), // Description for `code`
})

// FileDto Schema (map of file paths to FileContentDto)
const FileDtoSchema = z.record(
	z.string().describe("The file path as a string"),
	z.string().describe("The source code inside a file")
)

// ProjectDto Schema
const ProjectDtoSchema = z.object({
	sourceCode: FileDtoSchema.describe("A map of file paths to their file content"),
})

export default ProjectDtoSchema