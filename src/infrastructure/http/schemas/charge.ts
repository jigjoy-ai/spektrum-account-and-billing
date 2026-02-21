export const chargeSchema = {
	type: "object",
	required: ["providerCostUsd"],
	properties: {
		providerCostUsd: {
			type: "number",
		},
	},
}
