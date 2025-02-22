import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { RootAnnotation } from "./team"

// Product Owner Node
const productOwner = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { userRequest } = _state

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(`You are an product owner exper. Your task is to transform user request into ticket for developers.

			Create a concise and minimal description. If the request is too broad try to minimize the request.
			For example if the user demand note taking app, try to figure out what is the essence for this request.

			Good output in this case would be:
			Implement features: 
			 1) Enable user to add notes
			 2) Implement notes overview
			 
			Bad otput:
			Implement features:
				1) Implement login and registration to the system
				2) Enable user to add notes
			 	3) Implement notes overview
				4) Implement notes editin
				5) Implement note deletion
				6) Pay attention on performances

			To summuarize don't suggest any additional improvements nor too broad features - just essence of user request.

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
