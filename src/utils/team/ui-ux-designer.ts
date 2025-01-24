import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { RootAnnotation } from "./team"

// UI/UX Designer Node
const uiUxDesigner = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { ticket } = _state

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(` 

            You are an modern UI/UX expert.
            

			You job is to:
			1) design interface including layouts, components, styles, and interactions for most important user story.  
			2) You decide what should be visible on interface, component position and styling. Don't let devleopers to make design descisions like picking colors, etc...

			Context: {ticket}
			`),
		new ChatOpenAI({
			modelName: "gpt-4o",
			openAIApiKey: process.env.OPENAI_API_KEY,
			temperature: 0, // Deterministic output to avoid random responses
		}),
	])

	const design = await chain.invoke({
		ticket,
	})

	const updatedTicket = `Task Description: ${ticket} \n\nDesign Instructions: ${design.content.toString()}`

	console.log(`\n\n\nUI/UX Designer:\n\nUpdated Ticket:\n\n${updatedTicket}`)

	return {
		..._state,
		ticket: updatedTicket,
	}
}

export default uiUxDesigner
