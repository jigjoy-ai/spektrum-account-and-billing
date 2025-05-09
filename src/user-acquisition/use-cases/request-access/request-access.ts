import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { AccessRequestDto } from "src/user-acquisition/dto/access-request"
import { AccessRequest } from "src/user-acquisition/entity/access-request"
import { requestAccessRepository } from "src/user-acquisition/repositories/request-access-repository"

interface IEmail {
	getSubject(): string
	getBody(input?: any): string
}

class ClientEmail implements IEmail {
	getSubject(): string {
		return "Honeycomb Early Access"
	}

	getBody(): string {
		return `<html><body><p>You have been sent a request to access the Honeycomb beta. Our team will review your request and get back to you as soon as possible.</p></body></html>`
	}
}

class AdminEmail implements IEmail {
	getSubject(): string {
		return "Honeycomb Early Access Request"
	}

	getBody(input: any): string {
		return `<html><body><p>New user request for early access</p>
		<p>Email: ${input.email}</p>
		<p>Role: ${input.role}</p>
		<p>Description: ${input.description}</p>
		</body></html>`
	}
}	

const ses = new SESClient()



async function sendEmail(emailAddress: string, content: string) {
	const { FROM_ADDRESS } = process.env
	const email: IEmail = new ClientEmail()

	console.log(`Sending email to ${emailAddress} from ${FROM_ADDRESS} with content ${content}`)

	const command = new SendEmailCommand({
		Destination: {
			ToAddresses: [emailAddress],
		},
		Message: {
			Subject: { Data: email.getSubject() },
			Body: {
				Html: { Data: content },
			},
		},
		Source: FROM_ADDRESS,
	})

	try {
		let response = await ses.send(command)
		// process data.
		return response
	} catch (error) {
		console.log(error)
		// error handling.
		return error
	}
}

export async function requestAccessUseCase(request: AccessRequestDto): Promise<any> {

	const { ADMIN_EMAIL_1, ADMIN_EMAIL_2 } = process.env

	const requestEntity = AccessRequest.create(request)

	await requestAccessRepository(requestEntity)

	const clientEmail: IEmail = new ClientEmail()

	const clientEmailResponse = sendEmail(requestEntity.email, clientEmail.getBody())

	const adminEmail: IEmail = new AdminEmail()

	const adminEmailResponse1 = sendEmail(ADMIN_EMAIL_1 as string, adminEmail.getBody(requestEntity))
	const adminEmailResponse2 = sendEmail(ADMIN_EMAIL_2 as string, adminEmail.getBody(requestEntity))

	await Promise.all([clientEmailResponse, adminEmailResponse1, adminEmailResponse2])
}
