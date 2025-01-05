export const schema = {
	type: "object",
	required: ["message", "id"],
    properties: {
        id: {
            type: "string",
        },
        message: {
            type: "string",
        }
    }
}