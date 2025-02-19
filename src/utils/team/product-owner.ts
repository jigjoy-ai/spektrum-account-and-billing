import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { RootAnnotation } from "./team"

// Product Owner Node
const productOwner = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { userRequest } = _state

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(`Transform user request into ticket for developers.

			Create a concise and minimal description.

			User Request: {userRequest}
			`),
		new ChatOpenAI({
			modelName: "o1-mini",
			openAIApiKey: process.env.OPENAI_API_KEY,
		}),
	])

	const ticket = await chain.invoke({
		userRequest
	})

    console.log(`\n\n\nProduct Owner:\n\nTicket:\n\n${ticket.content.toString()}`)

	return {
		..._state,
		ticket: ticket.content.toString(),
	}
}

export { productOwner } 
