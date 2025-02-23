import { Annotation, StateGraph, START, END } from "@langchain/langgraph"
import { productOwner } from "./product-owner"
import { reactDeveloper } from "./react-developer"
import { ChangeRequestDto, SourceCode } from "@dto/project"
import { uiUxDesigner } from "./uiux-designer"
import { graphicDesigner } from "./graphic-designer"

// Define Root Annotation with Reducer
export const RootAnnotation = Annotation.Root({
	userRequest: Annotation<string>(),
	ticket: Annotation<string>({
		reducer: (a, b) => b,
	}),
	sourceCode: Annotation<SourceCode>({
		reducer: (a, b) => b,
	}),
	projectId: Annotation<string>,
})

class Team {

	static async implement(changeRequest: ChangeRequestDto) {

		const graph = new StateGraph({
			input: RootAnnotation,
			output: RootAnnotation,
		})
			.addNode("ProductOwner", productOwner)
			.addNode("ReactDeveloper", reactDeveloper)
			.addNode("UiUxDesigner", uiUxDesigner)
			.addNode("GraphicDesigner", graphicDesigner)
			.addEdge(START, "ProductOwner")
			.addEdge("ProductOwner", "UiUxDesigner")
			.addEdge("UiUxDesigner", "GraphicDesigner")
			.addEdge("GraphicDesigner", "ReactDeveloper")
			.addEdge("ReactDeveloper", END)
			.compile()

		const changes = await graph.invoke({
			userRequest: changeRequest.message,
			ticket: undefined,
			sourceCode: changeRequest.project.sourceCode,
			projectId: changeRequest.project.id
		})

		const newSourceCode: SourceCode = {
			...changes.sourceCode,
		}

		return newSourceCode
	}
}

export default Team
