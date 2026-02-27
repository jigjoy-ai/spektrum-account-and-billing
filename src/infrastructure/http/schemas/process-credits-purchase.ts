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
            required: ["id", "custom_data", "payments"],
            properties: {
                id: {
                    type: "string",
                },
                custom_data: {
                    type: "object",
                    required: ["organizationId", "email"],
                    properties: {
                        organizationId: {
                            type: "string",
                        },
                        email: {
                            type: "email",
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