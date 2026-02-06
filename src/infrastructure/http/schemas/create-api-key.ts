export const createApiKeySchema = {
	type: "object",
	required: ["accountId", "name"],
	properties: {
		accountId: {
			type: "string",
		},
		name: {
			type: "string",
			minLength: 1,
			maxLength: 25,
			pattern: "^[a-zA-Z0-9]+$",
			message: "Name must be alphanumeric and between 1 and 25 characters",
		},
	},
}
