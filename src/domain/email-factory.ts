import { Email } from "@domain/email"

export type LoginEmailParams = {
	recipient: string
	sender: string
	loginLink: string
	expirationInMinutes: number
}

export type PurchaseReceiptEmailParams = {
	recipient: string
	sender: string
	receiptUrl: string
}

export class EmailFactory {

	static createPurchaseReceiptEmail(params: PurchaseReceiptEmailParams): Email {
		const subject = "JigJoy Purchase Receipt"

		const body = `
			<html>
				<body>
					<p>Thank you for your purchase! Your invoice is attached to this email.</p>
				</body>
			</html>
		`.trim()

		const attachments = [
			{
				filename: "invoice.pdf",
				url: params.receiptUrl,
			},
		]

		return new Email(params.recipient, params.sender, subject, body, attachments)
	}
}
