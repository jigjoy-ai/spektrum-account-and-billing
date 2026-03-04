import { EmailTemplateRepository } from "@app/ports/repositories/email-template-repository"
import { OrganizationRepository } from "@app/ports/repositories/organization-repository"
import { TransactionRepository } from "@app/ports/repositories/transaction-repository"
import { EmailSender } from "@app/ports/services/email-sender"
import { PaymentProvider } from "@app/ports/services/payment-provider"
import { ProcessCreditsPurchaseParams, ProcessCreditsPurchaseUseCase } from "@app/ports/use-cases/process-credits-purchase"
import { Email } from "@domain/email"
import { EmailTemplate } from "@domain/email-template"
import { Transaction, TransactionStatus } from "@domain/transaction"

export class ProcessCreditsPurchase implements ProcessCreditsPurchaseUseCase {

    constructor(
        private readonly emailSender: EmailSender, 
        private readonly fromAddress: string, 
        private readonly organizationRepository: OrganizationRepository,
        private readonly paymentProvider: PaymentProvider,
        private readonly transactionRepository: TransactionRepository,
        private readonly emailTemplateRepository: EmailTemplateRepository
    ){ }

    async execute(params: ProcessCreditsPurchaseParams): Promise<void> {
        const { creditAmount, organizationId, transactionId, email } = params

        const transaction = await this.transactionRepository.getById(transactionId)
        if (transaction) {
            throw new Error("Transaction already processed")
        }


        const invoiceUrl = await this.paymentProvider.getInvoicePdfUrl(transactionId)
        const newTransaction = Transaction.createWithId(transactionId, organizationId, creditAmount, TransactionStatus.COMPLETED)
        await this.transactionRepository.save(newTransaction)

        const organization = await this.organizationRepository.getById(organizationId)

        if (!organization) {
            throw new Error("Organization not found")
        }

        organization.addCredits(creditAmount)
        await this.organizationRepository.save(organization)

        const template = new EmailTemplate("purchase", {
            numberOfCredits: creditAmount.toString(),
            transactionId: transactionId,
            estimatedTaskExecutions: (Number(creditAmount) * 2).toFixed(0),
        })
        const html = this.emailTemplateRepository.render(template)

        const attachments = [
			{
				filename: "invoice.pdf",
				url: invoiceUrl,
			},
		]

        const emailToSend = new Email(email, this.fromAddress, "JigJoy Purchase Receipt", html, attachments)
        
        await this.emailSender.sendEmail(emailToSend)

    }

}