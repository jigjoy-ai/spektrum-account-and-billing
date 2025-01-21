import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { StructuredOutputParser } from "langchain/output_parsers"
import ProjectDtoSchema from "@schemas/project.schema"
import { RootAnnotation } from "./team"


// Product Owner Node
const productOwnerNode = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { userRequest, sourceCode } = _state

    const parser = StructuredOutputParser.fromZodSchema(ProjectDtoSchema)

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(`You are an Product Owner expert. 

			Your job is to transform user requests into clear ticket with definition of done with bullet points for yout dev team. 
		
			User Request: {userRequest} 
		
			Current Project Source Code: {sourceCode}
			`),
		new ChatOpenAI({
			modelName: "gpt-4o",
			openAIApiKey: process.env.OPENAI_API_KEY,
			temperature: 0, // Deterministic output to avoid random responses
		}),
	])

	const ticket = await chain.invoke({
		userRequest: userRequest,
		outputSchema: parser.getFormatInstructions(),
		sourceCode: sourceCode,
	})

	return {
		ticket: ticket.content.toString(),
		sourceCode: sourceCode,
        userRequest: userRequest
        
	}
}

export default productOwnerNode
