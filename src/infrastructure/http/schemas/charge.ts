export const chargeSchema = {
	type: "object",
	required: ["organizationId", "providerCostUsd"],
	properties: {
		organizationId: {
			type: "string",
		},
		providerCostUsd: {
			type: "number",
		},
	},
}
