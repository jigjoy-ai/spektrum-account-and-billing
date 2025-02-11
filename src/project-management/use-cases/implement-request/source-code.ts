export const code = {
  "../../opt/nodejs/src/index.css": `
@import "tailwindcss";
    `,
  "../../opt/nodejs/src/index.tsx": `
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

  "../../opt/nodejs/src/App.tsx": `
    export default function App() {
	    return (
	        <div className="text-pink-500 font-bold">Hello world</div>
	);
}
`
};
