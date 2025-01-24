import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { pull } from "langchain/hub"
import { RootAnnotation } from "./team"

// Product Owner Node
const productOwnerNode = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { userRequest, context } = _state

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(`You are an Product Manager expert. 

			Transform user request into user stoeris, so that your dev team can work in parallel.
			User stories need to have number and as short as possible content.
			
			User Request: {userRequest}       
			`),
		new ChatOpenAI({
			modelName: "gpt-4o",
			openAIApiKey: process.env.OPENAI_API_KEY,
			temperature: 0, // Deterministic output to avoid random responses
		}),
	])

	const ticket = await chain.invoke({
		userRequest: userRequest
	})

    console.log(`\n\n\nProduct Owner:\n\nTicket:\n\n${ticket.content.toString()}`)

	return {
		..._state,
		ticket: ticket.content.toString(),
	}
}

export default productOwnerNode
