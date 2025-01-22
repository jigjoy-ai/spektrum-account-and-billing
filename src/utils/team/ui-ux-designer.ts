import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { StructuredOutputParser } from "langchain/output_parsers"
import ProjectDtoSchema from "@schemas/project.schema"
import { RootAnnotation } from "./team"


// UI/UX Designer Node
const uiUxDesigner = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { ticket } = _state

    const parser = StructuredOutputParser.fromZodSchema(ProjectDtoSchema)

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(` 

            You are an expert in UI/UX design. 

            You are well versed in modern design methodologies. You follow advanced heuristics to create optimized UX.
		
            You pay attention on contrast between colors (accessibility) so that everything is visible right. If the colors are not demanded by user you are striving to consistency and uses modern color pallets for UI.

            Your job is to refine the ticket and update the ticket description and definition of done with design guidelines that are as detailed as possible. Include detailed guide for devs on how to implement UI/UX.

			Ticket: {ticket} 
		
			`),
		new ChatOpenAI({
			modelName: "gpt-4o",
			openAIApiKey: process.env.OPENAI_API_KEY,
			temperature: 0, // Deterministic output to avoid random responses
		}),
	])

	const response = await chain.invoke({
		ticket: ticket
	})

    return {
        ..._state,
        ticket: response.content.toString()
    }
}

export default uiUxDesigner
