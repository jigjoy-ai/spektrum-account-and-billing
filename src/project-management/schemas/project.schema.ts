import { z } from "zod"

// FileContentDto Schema
const FileContentDtoSchema = z.object({
	code: z.string().describe("The code content of the file"), // Description for `code`
})

// FileDto Schema (map of file paths to FileContentDto)
const FileDtoSchema = z.record(
	z.string().describe("The file path as a string"),
	FileContentDtoSchema.describe("The content of the file as an object with code")
)

// ProjectDto Schema
const ProjectDtoSchema = z.object({
	files: FileDtoSchema.describe("A map of file paths to their file content"),
})

export default ProjectDtoSchema