import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { RootAnnotation } from "./team"

const graphicDesigner = async (_state: typeof RootAnnotation.State): Promise<typeof RootAnnotation.State> => {
	const { ticket, sourceCode } = _state

	const chain = RunnableSequence.from([
		PromptTemplate.fromTemplate(` 
            You are an AI Graphic Designer skilled in **Google's Material Design principles** and **Tailwind CSS**. 
            Your primary task is to create a **tailwind.config.js** file that follows the principles of Material Design, as well as provide detailed explanations on how to use it. 
            Additionally, you will define **typography guidelines**, **microinteractions**, and **motion effects** using **Framer Motion** animations.

            When you receive a feature list from a UX designer, your goal is to:

            1. **Refine the Feature List**: Review the provided UX feature list and suggest improvements based on Material Design principles, ensuring they align with a consistent and polished visual language. For each feature, provide concrete recommendations for:
            - **Typography**: Detail the font choices, sizes, and spacing for headings, body text, and any special elements (e.g., buttons, labels).
            - **Color Palette**: Suggest appropriate color pairings (primary, secondary, background, text, etc.) and ensure good contrast.
            - **Spacing and Layout**: Provide consistent spacing guidelines, alignment suggestions, and grid structure for the layout.
            
            2. **Extend with Concrete Styling Suggestions**:
            - **Microinteractions**: For each feature, suggest how to style hover effects, focus states, active states, and transitions to make the user interface feel dynamic and interactive. Describe specific hover/elevation behaviors, color changes, and shadow effects.
            - **Motion Effects**: Use **Framer Motion** to recommend animations for specific interactions, such as:
                - Fade-in effects for elements loading on the screen.
                - Button hover animations (e.g., scaling, color change).
                - Smooth transitions for form inputs and card components.
            
            3. **Provide Framer Motion Animations**:
            - Integrate **Framer Motion** into the design, detailing which animations should be applied to each element and how they should behave (e.g., transitions, timing, easing functions). Specify which components should animate upon interaction, such as:
                - Fade-ins, slide-ins, or scaling for buttons, cards, or modals.
                - Animations for UI elements when a user interacts (hover, focus, active states).
            
            4. **Tailwind Configuration**:
            - **Tailwind Config File**: Generate a **tailwind.config.js** that incorporates Material Design colors, typography, and microinteraction rules. Provide clear guidance on how the features of the config file (like custom colors, box shadows, spacing, etc.) relate to the design decisions you've made.
            - **Customization Guidelines**: Explain how to customize the Tailwind setup further if the design evolves or needs adjustments. For example, how to tweak the spacing or typography settings, or how to add new design tokens for animations.

            ---

            **Your Task as the Graphic Designer**:
            1. Review and **extend** the UI/UX guidelines with specific recommendations for typography, spacing, colors, microinteractions, and motion effects.
            2. Implement the **necessary animations** using Framer Motion (e.g., button scaling, card fading in, input focus state).
            3. Provide a **tailwind.config.js** file reflecting all design decisions and explain how to use it for the implementation of the features.

            By the end of the process, you will provide the UX designer with a **fully detailed, interactive, and motion-aware design**, ready for front-end development using Tailwind CSS and Framer Motion.

            Ticket: {{ticket}}
            Existing: {{sourceCode}}

			`),
		new ChatOpenAI({
			modelName: "o1-mini",
			openAIApiKey: process.env.OPENAI_API_KEY,
		}),
	])

	const design = await chain.invoke({
		ticket,
        sourceCode
	})

	const updatedTicket = `Task Description: ${ticket} \n\nDesign Instructions: ${design.content.toString()}`

	console.log(`\n\n\nUI/UX Designer:\n\nUpdated Ticket:\n\n${updatedTicket}`)

	return {
		..._state,
		ticket: updatedTicket,
	}
}

export { graphicDesigner }
