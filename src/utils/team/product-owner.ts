import { ChatOpenAI } from "@langchain/openai"
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { pull } from "langchain/hub"
import { RootAnnotation } from "./team"

// Product Owner Node
const productOwnerNode = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { userRequest } = _state

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(`You are an Product Manager. 

			Your job is to transform user request into user stories.

			Create a minimal number of user stories with short desription.

			Pick most important user story and pass to the team. Other user stories put in the backlog and say to everyone to do not work on user stories in the backlog.

			User Request: {userRequest}
			`),
		new ChatOpenAI({
			modelName: "gpt-4o",
			openAIApiKey: process.env.OPENAI_API_KEY,
			temperature: 0, // Deterministic output to avoid random responses
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

export default productOwnerNode
