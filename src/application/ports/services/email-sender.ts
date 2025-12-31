export interface EmailSenderPort {
	sendEmail(emailAddress: string, magicLink: string): Promise<void>
}