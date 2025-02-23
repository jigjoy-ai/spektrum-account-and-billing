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

const reactDeveloper = async (_state: typeof RootAnnotation.State): Promise<typeof DeveloperOutputAnnotation.State> => {
	const { sourceCode, ticket, projectId } = _state

	const parser = StructuredOutputParser.fromZodSchema(ProjectDtoSchema)

	console.log(`\n\n\nDeveloper:\n\nRecieved Ticket:\n\n${ticket}`)

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(`You are an expert React Developer.

			Your job is to modify project source code based on the ticket you received. 
			Use Tailwindcss to style UI elements and Framer motion to create a animation rich interactions.
			You need to figure out does source code already contain functionality, do you need to change existing functionaliy or you need to create new one.
			You don't need to implement functionality from scratch if the functionality is already implemented.
			

			Project id: {projectId}
			Here are the tickets that you need to solve: {ticket} 
            
			Current Source Code: {sourceCode}
		
			Important: Respond only in valid JSON. The JSON object you return should match the following schema:

            Example of valid response:
			{{
				"src/App.tsx": 'export default function App() {{ return <div>Hello World</div>; }}'
			}}

			Format Instructions: {outputSchema}

			`),
		new ChatOpenAI({
			modelName: "o1-mini",
			openAIApiKey: process.env.OPENAI_API_KEY,
		}),
		parser,
	])

	const changes = await chain.invoke({
		ticket: ticket,
		projectId: projectId,
		outputSchema: parser.getFormatInstructions(),
		sourceCode: sourceCode,
	})

	console.log(`\n\n\Changes:\n\n${changes}`)

	return changes
}

export { reactDeveloper, DeveloperOutputAnnotation }
