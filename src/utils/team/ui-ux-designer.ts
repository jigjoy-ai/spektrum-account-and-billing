import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { RootAnnotation } from "./team"


// UI/UX Designer Node
const uiUxDesigner = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { ticket, userRequest } = _state

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(` 

            You are an modern UI/UX expert.
            
			Your job is to:
			1 - Transform user request into user stories
			2 - Design interface for each user story.
			
			Each user story should have extensive details for implementing feature including:
			 layouts, components, styling, and interaction flow.

			Create a minimal number of user stories.

			User Request: {userRequest}

			`),
		new ChatOpenAI({
			modelName: "gpt-4o",
			openAIApiKey: process.env.OPENAI_API_KEY,
			temperature: 0.4, // Deterministic output to avoid random responses
		}),
	])


	const design = await chain.invoke({
		userRequest
	})

	const updatedTicket = `Task Description: ${ticket} \n\nDesign Instructions: ${design.content.toString()}` 

    console.log(`\n\n\nUI/UX Designer:\n\nUpdated Ticket:\n\n${updatedTicket}`)

    return {
        ..._state,
        ticket: updatedTicket
    }
}

export default uiUxDesigner
