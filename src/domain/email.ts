export class Email {
	private readonly recipient: string
    private readonly sender: string
    private readonly subject: string
    private readonly body: string

    constructor(recipient: string, sender: string, subject: string, body: string) {
        this.recipient = recipient
        this.sender = sender
        this.subject = subject
        this.body = body
    }

    getRecipient(): string {
        return this.recipient
    }

    getSender(): string {
        return this.sender
    }

    getSubject(): string {
        return this.subject
    }
    
    getBody(): string {
        return this.body
    }
}