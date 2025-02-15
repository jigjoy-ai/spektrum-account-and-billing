import { S3, PutObjectCommand } from "@aws-sdk/client-s3"

const s3 = new S3()
const deployBucket = process.env.DEPLOY_BUCKET

// Function to determine the correct content type
const getContentType = (fileName: string) => {
	const ext : string = fileName.split(".").pop() as string
	const contentTypes: any = {
		html: "text/html",
		js: "application/javascript",
		ico: "image/x-icon",
	}
	return contentTypes[ext] || "application/octet-stream"
}

export async function uploadFile(file: {
	filename: string
	content: Buffer
	projectId: string
}): Promise<void> {
	const folderPath = `${file.projectId}/`

	const params = {
		Bucket: deployBucket,
		Key: `${folderPath}${file.filename}`,
		Body: file.content,
		ContentType: getContentType(file.filename)
	}

	try {
		await s3.send(new PutObjectCommand(params))

	} catch (error) {
		console.error("S3 file upload error:", error)
		throw new Error("S3 file upload failed")
	}
}
