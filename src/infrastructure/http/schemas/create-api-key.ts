export const createApiKeySchema = {
	type: "object",
	required: ["name"],
	properties: {
		name: {
			type: "string",
			minLength: 1,
			maxLength: 25,
			message: "Name must be string and between 1 and 25 characters",
		},
	},
}
