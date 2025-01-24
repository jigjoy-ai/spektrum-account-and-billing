import { Annotation, StateGraph, START, END } from "@langchain/langgraph"
import productOwnerNode from "./product-owner"
import { reactDeveloperNode } from "./react-developer"
import { ChangeRequestDto, SourceCode } from "@dto/project"
import uiUxDesigner from "./ui-ux-designer"
import { Document } from "@langchain/core/documents"

// Define Root Annotation with Reducer
export const RootAnnotation = Annotation.Root({
	userRequest: Annotation<string>(),
	ticket: Annotation<string>({
		reducer: (a, b) => b,
	}),
	sourceCode: Annotation<SourceCode>({
		reducer: (a, b) => b,
	}),
	context: Annotation<Document[]>,
})

class Team {
	static async implement(changeRequest: ChangeRequestDto) {

		const graph = new StateGraph({
			input: RootAnnotation,
			output: RootAnnotation,
		})
			//.addNode("ProductOwner", productOwnerNode)
			.addNode("ReactDeveloper", reactDeveloperNode)
			.addNode("UiUxDesigner", uiUxDesigner)
			.addEdge(START, "UiUxDesigner")
			//.addEdge("ProductOwner", "UiUxDesigner")
			.addEdge("UiUxDesigner", "ReactDeveloper")
			.addEdge("ReactDeveloper", END)
			.compile()

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
