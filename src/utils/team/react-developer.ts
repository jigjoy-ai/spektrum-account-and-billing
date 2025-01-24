import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { Annotation } from "@langchain/langgraph"
import { SourceCode } from "@dto/project"
import { StructuredOutputParser } from "@langchain/core/output_parsers"
import ProjectDtoSchema from "@schemas/project.schema"
import { RootAnnotation } from "./team"

const DeveloperOutputAnnotation = Annotation.Root({
	sourceCode: Annotation<SourceCode>(),
})

const reactDeveloperNode = async (
	_state: typeof RootAnnotation.State
): Promise<typeof DeveloperOutputAnnotation.State> => {
	const { sourceCode, ticket } = _state

	const parser = StructuredOutputParser.fromZodSchema(ProjectDtoSchema)

    console.log(`\n\n\nDeveloper:\n\nRecieved Ticket:\n\n${ticket}`)

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(`You are an expert React developer specializing in TanStack, Tailwind CSS, and Framer Motion. 

			Your job is to modify project source code based on the tickets you received. 
		
			Here are the tickets that you need to solve: {ticket} 
            
			Current Source Code: {sourceCode}
		
			Important: Respond only in valid JSON. The JSON object you return should match the following schema:

            Example of valid response:
			{{
				  "sourceCode": {{
					"/App.tsx": "export default function App() {{ return <div>Hello World</div>; }}"
				  }}
			}}

			Format Instructions: {outputSchema}

			Important: Output must also contain the files that you didn't edit along with the files you have edited and created. 
			Important: You need to return working files of the React project.
            Important: You are not allowed to use external dependencies! For example if the user requested drag-and-drop, do not import any external dependency, but implement requested functionality from scratch.
			Important: Do not generate, nor use tailwind.config.js, because it's not supported by the environment. Instead, directly type values to the tailwind commands (e.g text-[#ff5733]).
            Important: You don't need to import tailwindcss because it's already imported. Also refine /App.tsx with example of using newly created component.
			`),
		new ChatOpenAI({
			modelName: "gpt-4o",
			openAIApiKey: process.env.OPENAI_API_KEY,
			temperature: 0, // Deterministic output to avoid random responses
		}),
		parser,
	])

	const changes = await chain.invoke({
		ticket: ticket,
		outputSchema: parser.getFormatInstructions(),
		sourceCode: sourceCode,
	})

    console.log(`\n\n\Changes:\n\n${JSON.stringify(changes)}`)

	return changes
}

export { reactDeveloperNode, DeveloperOutputAnnotation }
