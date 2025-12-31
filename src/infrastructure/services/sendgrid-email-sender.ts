import { EmailSenderPort } from "@app/ports/services/email-sender"
import * as sgMail from '@sendgrid/mail'
import EmailTemplate from "@domain/value-objects/email-template"

const { FROM_ADDRESS, SENDGRID_API_KEY } = process.env
const TIMEOUT_MINS = 5

export class SendgridEmailSender implements EmailSenderPort {

    async sendEmail(emailAddress: string, magicLink: string): Promise<void> {
        
        const emailTemplate = new EmailTemplate()
    
        sgMail.setApiKey(SENDGRID_API_KEY as string)
        // sgMail.setDataResidency('eu'); 
        // uncomment the above line if you are sending mail using a regional EU subuser
    
        const msg = {
            to: emailAddress, // Change to your recipient
            from: FROM_ADDRESS as string, // Change to your verified sender
            subject: emailTemplate.getSubject(),
            text: 'and easy to do anywhere, even with Node.js',
            html: emailTemplate.getBody(magicLink, TIMEOUT_MINS),
        }
        
    
        try {
            await sgMail.send(msg)
        } catch (error) {
            console.log(error)
        }
    }
}