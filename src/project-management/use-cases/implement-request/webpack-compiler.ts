import { createFsFromVolume, Volume } from "memfs"
import { webpack } from "webpack"
import * as fs from "fs"
import { ufs } from "unionfs"
import { uploadFile } from "@utils/upload-file"

const path = require("path")

export const buildSourceCode = async (sourceCode: any, projectId: string) => {
	const prefix = "../../opt/nodejs/"

	sourceCode = Object.fromEntries(Object.entries(sourceCode).map(([key, value]) => [prefix + key, value]))

	const memoryVolume = Volume.fromJSON(sourceCode)

	const memfs = createFsFromVolume(memoryVolume)

	ufs.use(fs).use(memfs as any)

	console.log("📂 Virtual Filesystem Structure:", ufs.readdirSync("../../opt/nodejs"))

	const config = require(path.resolve("../../opt/nodejs/webpack.config.js"))
	
	const compiler = webpack(config)

	compiler.inputFileSystem = ufs as any
	compiler.outputFileSystem = fs as any

	const buildTask = compiler.run(async (err, stats) => {
		if (err) {
			console.error(err)
			return
		}

		console.log(stats?.toString({ colors: true }))

		console.log(ufs.readdirSync("../../opt/nodejs/dist"))

		let outputDir = "../../tmp/dist"
		const files = ufs.readdirSync(outputDir)
		const uploadPromises = files.map((filename) => {
			uploadFile({
				filename: filename,
				content: ufs.readFileSync(outputDir + "/" + filename),
				projectId: projectId,
			})
		})
		await Promise.all(uploadPromises)


		

		// Close the compiler after the process
		compiler.close(() => {
			console.log("Compiler closed.")
		})
	})

	await Promise.resolve(buildTask)
}
