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
                    required: ["email"],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
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