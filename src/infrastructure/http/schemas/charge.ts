export const chargeSchema = {
	type: "object",
	required: ["accountId", "providerCostUsd"],
	properties: {
		accountId: {
			type: "string",
		},
		providerCostUsd: {
			type: "number",
		},
	},
}
