export const chargeSchema = {
	type: "object",
	required: ["accountId", "amount"],
	properties: {
		accountId: {
			type: "string",
		},
		amount: {
			type: "number",
		},
	},
}
