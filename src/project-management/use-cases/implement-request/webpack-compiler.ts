import { createFsFromVolume, Volume } from "memfs"
import { webpack } from "webpack"
import { code } from "./source-code"
import * as fs from "fs"
import { ufs } from "unionfs"

const path = require("path")

export const buildSourceCode = async () => {
	const files = code

	const memoryVolume = Volume.fromJSON(files)

	const memfs = createFsFromVolume(memoryVolume)

	ufs.use(fs).use(memfs as any)

	console.log("📂 Virtual Filesystem Structure:", ufs.readdirSync("../../opt/nodejs"))

	const config = require(path.resolve("../../opt/nodejs/webpack.config.js"))

	const compiler = webpack(config)

	compiler.inputFileSystem = ufs as any
	compiler.outputFileSystem = ufs as any;

	await compiler.run((err, stats) => {
		if (err) {
			console.error(err)
			return
		}
		console.log(stats?.toString({ colors: true }))
		console.log("Output:", ufs.readdirSync("../../opt/nodejs/dist"))
		
	})


	


	// Close the compiler after the process
	compiler.close(() => {
		console.log("Compiler closed.")
	})
}
