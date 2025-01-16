import { ChatOpenAI } from "@langchain/openai"
import ProjectDtoSchema from "@schemas/project.schema"
import { ChangeRequestDto } from "@dto/project"
import { StructuredOutputParser } from "langchain/output_parsers"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"

const parser = StructuredOutputParser.fromZodSchema(ProjectDtoSchema)

export async function refactorProjectUseCase(changeRequest: ChangeRequestDto): Promise<any> {
	try {

		const project_info = JSON.stringify(changeRequest.project)

		const chain = RunnableSequence.from([
			PromptTemplate.fromTemplate(`You are an expert React developer specializing in TanStack, Tailwind CSS, and Framer Motion. Your job is to build and modify files for a React project. 
		Each file should return a component that meets the user's description.
		
		The current project files:{project_info}

		You MUST return a JSON object matching the following Zod schema:
		
		Example response:
		{{
		  "id": "some-project-id",
		  "files": {{
			"/App.tsx": {{
			  "code": "export default function App() {{ return <div>Hello World</div>; }}"
			}}
		  }}
		}}
		
		User Message: 
		Build the React project based on the user's request. Return the ProjectDto in JSON format.
		
		Important: 
		1) You don't need to import tailwindcss because it's already imported. Also refine /App.tsx with example of using newly created component.
		2) You need to return working version of React project. Do not delete files which are used in the project! 
		3) Don't wrap json output with backticks and ensure the content is properly formatted as valid JSON ready for parsing.
		  .\n{format_instructions}\n{message}`),
			new ChatOpenAI({
				modelName: "gpt-4o",
				openAIApiKey: process.env.OPENAI_API_KEY,
				temperature: 0, // Deterministic output to avoid random responses
			}),
			parser,
		])

		const response = await chain.invoke({
			message: changeRequest.message,
			format_instructions: parser.getFormatInstructions(),
			project_info: project_info
		})

		return response
	} catch (error) {
		console.error("Error:", error)
	}
}