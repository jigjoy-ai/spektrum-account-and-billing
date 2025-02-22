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

			Your task is to provide **precise, step-by-step guidelines** for implementing a specific feature in a digital product using principles inspired by **Shneiderman’s Eight Golden Rules**, but **without explicitly mentioning them**. 

			### **Rules for Your Response:**  
			1. **Do not go beyond the requested feature.** Stay hyper-focused.  
			2. **Extract only the most relevant UX rules** for the feature—avoid unnecessary ones.  
			3. **Provide a step-by-step implementation guide** that directly translates into UI/UX design decisions.  
			4. **Do not mention Shneiderman’s rules explicitly.**  
			5. **Ensure your steps are minimal yet comprehensive for practical execution.**  

			### **Feature Request:**  
			{ticket}

			### **Expected Output Format:**  
			- **Concrete Steps to Implement "{{feature_name}}"**  
			- Step-by-step guidelines that focus only on what is necessary for the feature.  
			- Avoid general UX theory—keep it practical and actionable.  

			### **Example Input:**  
			Feature Request: Implement an "Edit Note" feature in a note-taking app.

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
			### **Concrete Steps to Implement "Edit Note"**  

			1) **Provide a Clearly Visible Edit Button**  
			- Place the "Edit" button next to each note.  
			- Ensure it's large enough to tap on mobile.  

			2) **Open a Full-Screen Editor with Immediate Focus**  
			- When clicking "Edit," transition to a **full-screen** editor.  
			- Autofocus on the text area so users can start typing immediately.  

			3) **Ensure Smooth Saving & Feedback**  
			- Autosave changes every few seconds.  
			- Show a small **"Saved ✅"** indicator after each save.  

			4) **Warn Before Exiting with Unsaved Changes**  
			- If the user tries to close without saving, show a **confirmation popup**:  
			_“You have unsaved changes. Save before exiting?”_  

			5) **Allow Undo for Recent Edits**  
			- Provide an **"Undo Changes"** button that reverts to the last saved version.

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
