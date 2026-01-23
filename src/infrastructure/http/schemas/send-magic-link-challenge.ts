export const sendMagicLinkChallengeSchema = {
	type: "object",
	required: ["email"],
	properties: {
		email: {
			type: "string",
			format: "email",
		},
	},
}
