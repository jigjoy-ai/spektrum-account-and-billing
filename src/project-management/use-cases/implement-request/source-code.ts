export const code = {
  "src/index.css": `
@import "tailwindcss";
    `,
  "src/index.tsx": `
	import React, { StrictMode } from "react";
  	import { createRoot } from "react-dom/client";
  	import App from "./App";
	import "./index.css"; 

    const root = createRoot(document.getElementById("root"));
    root.render(
	    <StrictMode>
	        <App />
            </StrictMode>
    );`,

  "src/App.tsx": `
    export default function App() {
	    return (
	        <div className="text-pink-500 font-bold">Hello world</div>
	);
}
`
};
