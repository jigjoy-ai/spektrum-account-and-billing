import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { pull } from "langchain/hub"
import { RootAnnotation } from "./team"

// Product Owner Node
const productOwnerNode = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { userRequest, context } = _state

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(`You are an Product Owner expert. 

			Your job is to transform user requests into clear ticket with definition of done with bullet points for yout dev team. 
		
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
