import { ProjectDto } from "@dto/project"

const buildApi = process.env.BUILD_API

export async function buildProject(project: ProjectDto): Promise<void> {
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(project),
	}

	await fetch(`${buildApi}/build`, options)
}