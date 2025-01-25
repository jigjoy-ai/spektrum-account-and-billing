export const accessRequestSchema = {
	type: "object",
	required: ["message", "email", "name"],
    properties: {
        email: {
            type: "string",
        },
        name: {
            type: "string",
        },
        message: {
            type: "string",
        }
    }
}