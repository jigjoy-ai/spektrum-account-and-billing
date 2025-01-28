import { createFsFromVolume, Volume } from "memfs"
import { webpack, Compiler, Configuration } from "webpack"

import * as path from "path"

export const buildSourceCode = async () => {
	const inputPath = "/index.js"
	const files = {
		"/index.js": `
        module.exports = function multiply(a, b) {
			return a*b;
		}`,
	}

	const memoryVolume = Volume.fromJSON(files)

	const memfs = createFsFromVolume(memoryVolume)

	// Define Rspack configuration
	const config: Configuration = {
		mode: "production",
		entry: inputPath, // Entry should be the in-memory file path
		output: {
			path: "/dist", // Output directory in the in-memory filesystem
			filename: "bundle.js",
			library: {
				type: "commonjs2", // Export as CommonJS
			},
		},
		// Enable webpack-like configuration for memfs
		resolve: {
			extensions: [".js"],
		},
	}

	// Create and configure a Compiler instance
	const compiler: Compiler = webpack(config)
	compiler.inputFileSystem = memfs as any
	compiler.outputFileSystem = memfs as any

	// Run the compiler
	compiler.run((err, stats) => {
		if (err) {
			console.error("Compilation error:", err)
			return
		}

		if (stats?.hasErrors()) {
			console.error("Compilation errors:", stats.toJson().errors)
			return
		}

		console.log("Compilation succeeded!")

		// Access the compiled output from the in-memory filesystem
		const outputPath = path.join(config.output?.path || "", config.output?.filename?.toString() || "")
		const compiledCode = memoryVolume.readFileSync(outputPath, "utf-8").toString()

		// Dynamically execute the compiled bundle
		const compiledFunction = new Function("module", "exports", "require", compiledCode)
		const module = { exports: {} }
		compiledFunction(module, module.exports, require)
		// Test the compiled function
		const multiply = module.exports as (a: number, b: number) => number
		console.log("Result of multiply(4, 5):", multiply(4, 5))
	})

	// Close the compiler after the process
	compiler.close(() => {
		console.log("Compiler closed.")
	})

	return files
}
