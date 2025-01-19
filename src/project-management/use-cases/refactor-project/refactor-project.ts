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
			PromptTemplate.fromTemplate(`You are an expert React developer specializing in TanStack, Tailwind CSS, and Framer Motion. 

				Your job is to modify project source code based on the user request. 
			
				User Request: {message} 
			
				Current Project Source Code: {project_info}
			
			
				Important: Respond only in valid JSON. The JSON object you return should match the following schema:

				{{
		  			"files": {{
						"/App.tsx": {{
			  				"code": "export default function App() {{ return <div>Hello World</div>; }}"
						}}
		  			}}
				}}

				Format Instructions: {format_instructions}

				Important: You don't need to import tailwindcss because it's already imported. Also refine /App.tsx with example of using newly created component.
				Important: You need to return working version of React project. Do not delete files which are used in the project! Only when user explicitly request to delete or remove specific file do it.
				`),
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
			project_info: project_info,
		})

		return response
	} catch (error) {
		console.error("Error:", error)
	}
}
