import { DownloadInvoicePdfUseCase } from "@app/ports/use-cases/download-invoice-pdf"
import { extractAuthData } from "@heksagon/http"
import { APIGatewayProxyEvent } from "aws-lambda"
import { Auth } from "@heksagon/app"
import { UserData } from "@jigjoy-ai/auth"

export const createDownloadInvoicePdfHandler = (downloadInvoicePdfUseCase: DownloadInvoicePdfUseCase) => {
    return async (event: APIGatewayProxyEvent) => {

        const auth: Auth<UserData> = extractAuthData(event.headers)
        const { transactionId } = event.pathParameters as { transactionId: string }
        const buffer = await downloadInvoicePdfUseCase.execute(auth, { transactionId })
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="invoice-${transactionId}.pdf"`,
            },
            body: buffer.toString('base64'),
            isBase64Encoded: true,
        }
    }
}