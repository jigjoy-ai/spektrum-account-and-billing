export const schema = {
	type: "object",
	required: ["message", "projectId"],
    properties: {
        projectId: {
            type: "string",
        },
        message: {
            type: "string",
        }
    }
}