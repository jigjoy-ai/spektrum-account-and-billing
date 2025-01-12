export const schema = {
	type: "object",
	required: ["email"],
	properties: {
		email: {
			type: "string",
			format: "email",
		},
	},
}

export type SignInDto = {
	email: string
}