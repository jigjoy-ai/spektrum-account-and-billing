import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { RootAnnotation } from "./team"

// UI/UX Designer Node
const uiUxDesigner = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { ticket } = _state

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(` 

			You are an expert UI/UX designer specializing in human-computer interaction, following Shneiderman’s Eight Golden Rules. But actually you should focus on 6 from 8 rules.

			Your task is to provide **precise, step-by-step guidelines** for implementing a specific feature in a digital product using principles inspired by **Shneiderman’s Eight Golden Rules**. 

			### **Rules for Your Response:**  
			1. **Do not go beyond the requested feature.** Stay hyper-focused.  
			2. **Use Shneiderman’s Eight Golden Rules** to structure your response. But exclude this two rules from response: Support Internal Locus of Control and Enable Frequent Users to Use Shortcuts!
			3. **Give clear, actionable implementation steps.** Avoid general theory or adding additional features.  
			4. **Ensure your steps are minimal yet comprehensive for practical execution.**  
			5. **For each feature you should provide separate rules.**  

			### **Requested Features:**  
			{ticket}

			### **Expected Output Format:**  
			- **Concrete Steps to Implement "{{feature_name}}"**  
			- Step-by-step guidelines that focus only on what is necessary for the feature.  
			- Avoid general UX theory—keep it practical and actionable.  

			### **Example Input:**  
			Feature Request: Implement an "Edit Note" feature in a note-taking app.

			### **Output Format:**  
			### **1. Strive for Consistency**  
			- Use the same UI structure as the "Add Note" feature.  
			- Keep the "Edit" button in a **predictable location** (e.g., next to each note).  

			### **2. Offer Informative Feedback**  
			- Show an **autosave indicator** (e.g., “Saving…” → “Saved ✅”).  
			- Highlight unsaved changes with a **visual cue (e.g., yellow border)**.  

			### **3. Design Dialogs to Yield Closure**  
			- When exiting with unsaved changes, **prompt the user**:  
			_“You have unsaved changes. Do you want to save before closing?”_  

			### **4. Prevent Errors**  
			- Disable the **"Save"** button if no changes are made.  
			- Provide **undo functionality** for text modifications.  

			### **5. Permit Easy Reversal of Actions**  
			- Include a **"Revert to last saved version"** option.  

			### **6. Reduce Short-Term Memory Load**  
			- Show a **"Last edited on [timestamp]"** label.  
			- Maintain **cursor position** after reopening an edited note.  

			`),
		new ChatOpenAI({
			modelName: "o1-mini",
			openAIApiKey: process.env.OPENAI_API_KEY,
		}),
	])

	const design = await chain.invoke({
		ticket
	})

	const updatedTicket = `Task Description: ${ticket} \n\nDesign Instructions: ${design.content.toString()}`

	console.log(`\n\n\nUI/UX Designer:\n\nUpdated Ticket:\n\n${updatedTicket}`)

	return {
		..._state,
		ticket: updatedTicket,
	}
}

export { uiUxDesigner }
