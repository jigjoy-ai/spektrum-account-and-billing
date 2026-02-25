export type Attachment = {
	filename: string
	url: string
}

export class Email {
	private readonly recipient: string
	private readonly sender: string
	private readonly subject: string
	private readonly body: string
	private readonly attachments: Attachment[]

	constructor(recipient: string, sender: string, subject: string, body: string, attachments: Attachment[] = []) {
		this.recipient = recipient
		this.sender = sender
		this.subject = subject
		this.body = body
		this.attachments = attachments
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

	getAttachments(): Attachment[] {
		return this.attachments
	}
}
