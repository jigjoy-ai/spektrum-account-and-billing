import { Annotation, StateGraph, START } from "@langchain/langgraph"
import productOwnerNode from "./product-owner"
import { reactDeveloperNode } from "./react-developer"
import { ChangeRequestDto, SourceCode } from "@dto/project"

// Define Root Annotation with Reducer
export const RootAnnotation = Annotation.Root({
    userRequest: Annotation<string>(),
    ticket: Annotation<string>(), // Ticket created by Product Owner
    sourceCode: Annotation<SourceCode>({
        reducer: (a, b) => b 
    })
  })
  
const graph = new StateGraph({
    input: RootAnnotation,
    output: RootAnnotation,
})
    .addNode("ProductOwner", productOwnerNode)
    .addNode("ReactDeveloper", reactDeveloperNode)
    .addEdge(START, "ProductOwner")
    .addEdge("ProductOwner", "ReactDeveloper")
    .compile()

class Team {


	static async implement(changeRequest: ChangeRequestDto) {
		const changes = await graph.invoke({
			userRequest: changeRequest.message,
            ticket: undefined,
            sourceCode: changeRequest.project.sourceCode,
		})

		const newSourceCode: SourceCode = {
			...changeRequest.project.sourceCode,
			...changes.sourceCode,
		}

        return newSourceCode
	}
}

export default Team
