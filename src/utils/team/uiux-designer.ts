import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { RootAnnotation } from "./team"

// UI/UX Designer Node
const uiUxDesigner = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { ticket } = _state

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(` 

			You are an expert UI/UX designer specializing in human-computer interaction, following Shneiderman’s Eight Golden Rules. 

			Your task is to provide **precise, step-by-step guidelines** for implementing a **single feature** in a digital product. 

			### **Rules for Your Response:**  
			1. **Do not go beyond the requested feature.** Stay hyper-focused.  
			2. **Use Shneiderman’s Eight Golden Rules** to structure your response.  
			3. **Each rule should be applied only if relevant** to the specific feature.  
			4. **Give clear, actionable implementation steps.** Avoid general theory.  
			5. **Use technical language when needed** but keep the response practical.  

			### **Feature Request:**  
			{ticket}

			### **Output Format:**  
			- **1. Strive for Consistency** → [Guidelines specific to the feature]  
			- **2. Enable Frequent Users to Use Shortcuts** → [Only if relevant]  
			- **3. Offer Informative Feedback** → [Step-by-step feedback mechanisms]  
			- **4. Design Dialogs to Yield Closure** → [How the feature confirms completion]  
			- **5. Prevent Errors** → [Error prevention mechanisms]  
			- **6. Permit Easy Reversal of Actions** → [Undo/restore strategies]  
			- **7. Support Internal Locus of Control** → [Customization options]  
			- **8. Reduce Short-Term Memory Load** → [Minimize cognitive effort]  

			### **Example Response (For "Add Note" Feature):**  
			Feature Request: Implement an "Edit Note" feature in a note-taking app. 

			Expected Output:
			### **1. Strive for Consistency**  
			- Use the same UI structure as the "Add Note" feature.  
			- Keep the "Edit" button in a **predictable location** (e.g., next to each note).  

			### **2. Enable Frequent Users to Use Shortcuts**  
			- Allow users to open the editor with **double-click** or \`Ctrl + E\`.  

			### **3. Offer Informative Feedback**  
			- Show an **autosave indicator** (e.g., “Saving…” → “Saved ✅”).  
			- Highlight unsaved changes with a **visual cue (e.g., yellow border)**.  

			### **4. Design Dialogs to Yield Closure**  
			- When exiting with unsaved changes, **prompt the user**:  
			_“You have unsaved changes. Do you want to save before closing?”_  

			### **5. Prevent Errors**  
			- Disable the **"Save"** button if no changes are made.  
			- Provide **undo functionality** for text modifications.  

			### **6. Permit Easy Reversal of Actions**  
			- Include a **"Revert to last saved version"** option.  

			### **7. Support Internal Locus of Control**  
			- Let users customize font size, colors, and formatting options.  

			### **8. Reduce Short-Term Memory Load**  
			- Show a **"Last edited on [timestamp]"** label.  
			- Maintain **cursor position** after reopening an edited note.  


			Ensure your response is **concise, structured, and directly actionable** without unrelated details.  

			`),
		new ChatOpenAI({
			modelName: "o1-mini",
			openAIApiKey: process.env.OPENAI_API_KEY,
		}),
	])

	const design = await chain.invoke({
		ticket,
	})

	const updatedTicket = `Task Description: ${ticket} \n\nDesign Instructions: ${design.content.toString()}`

	console.log(`\n\n\nUI/UX Designer:\n\nUpdated Ticket:\n\n${updatedTicket}`)

	return {
		..._state,
		ticket: updatedTicket,
	}
}

export { uiUxDesigner }
