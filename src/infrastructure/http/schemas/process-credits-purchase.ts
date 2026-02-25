export const processCreditsPurchaseSchema = {
    type: "object",
    required: ["occurred_at", "data"],
    properties: {
        occurred_at: {
            type: "string",
            format: "date-time",
        },
        data: {
            type: "object",
            required: ["custom_data", "payments"],
            properties: {
                custom_data: {
                    type: "object",
                    required: ["organizationId"],
                    properties: {
                        organizationId: {
                            type: "string",
                        },
                    },
                },
                payments: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["amount"],
                        properties: {
                            amount: {
                                type: "string"
                            }
                        }
                    }
                },
            },
        },
    },
}