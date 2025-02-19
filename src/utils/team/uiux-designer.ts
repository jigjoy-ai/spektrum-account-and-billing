import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { RootAnnotation } from "./team"

// UI/UX Designer Node
const uiUxDesigner = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { ticket } = _state

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(` 

            You are an UI/UX expert.

			You job is to create a UX flow for given ticket. Keep instructions minimal and as clear as possible. Do not suggest UX flows that are unrelated to the ticket description. Only cover the main flow in the ticket. 

			Ticket: {ticket}
			`),
		new ChatOpenAI({
			modelName: "o1-mini",
			openAIApiKey: process.env.OPENAI_API_KEY
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

export { uiUxDesigner } 
