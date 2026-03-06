export const verifyMagicLinkChallengeSchema = {
	type: "object",
	required: ["email", "challenge"],
	properties: {
		email: {
			type: "string",
			format: "email",
		},
		challenge: {
			type: "string",
		},
	},
}
