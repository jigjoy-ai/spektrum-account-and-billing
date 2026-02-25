import { PaymentProvider } from "@app/ports/services/payment-provider"

export class PaddlePaymentProvider implements PaymentProvider {
    
    private readonly paddleApiKey: string
    private readonly paddleApiUrl: string

    constructor() {
        try {
            this.paddleApiKey = process.env.PADDLE_API_KEY as string
            this.paddleApiUrl = process.env.PADDLE_API_URL as string
        } catch (error) {
            console.error(`Failed to initialize Paddle payment provider: ${error}`)
        }
    }

    async getInvoicePdfUrl(transactionId: string): Promise<string> {
        const res = await fetch(`${this.paddleApiUrl}/transactions/${transactionId}/invoice?disposition=attachment`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${this.paddleApiKey}`,
                    "Paddle-Version": "1"
                },
            }
        )
            
        if (!res.ok) {
            const text = await res.text()
            throw new Error(`Paddle invoice fetch failed: ${res.status} ${text}`)
        }
            
        const json = await res.json() as { data: { url: string } }
        return json.data.url as string
    }
}