import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { RootAnnotation } from "./team"


// UI/UX Designer Node
const uiUxDesigner = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { ticket } = _state

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(` 

            You are an expert in UI/UX design.
            Your job is to refine the ticket and update the ticket's definition-of-done with concrete design instructions.

			Ticket: {ticket}

            Important: If the colors or other design details are not provided by user you are striving to consistency and uses modern color pallets for UI.
			`),
		new ChatOpenAI({
			modelName: "gpt-4o",
			openAIApiKey: process.env.OPENAI_API_KEY,
			temperature: 0.4, // Deterministic output to avoid random responses
		}),
	])


	const updatedTicket = await chain.invoke({
		ticket: ticket
	})

    console.log(`\n\n\nUI/UX Designer:\n\nUpdated Ticket:\n\n${updatedTicket.content.toString()}`)

    return {
        ..._state,
        ticket: updatedTicket.content.toString()
    }
}

export default uiUxDesigner
