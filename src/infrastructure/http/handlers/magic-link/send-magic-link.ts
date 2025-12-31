import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import {
	CognitoIdentityProviderClient,
	AdminGetUserCommand,
	AdminCreateUserCommand,
	AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import { escape } from "querystring"
import { schema } from "../../schemas/magic-link"
import * as sgMail from '@sendgrid/mail'
import { encrypt } from "@infra/encription/encription"
import EmailTemplate from "@domain/value-objects/email-template"
import { MagicLinkDTO } from "@app/dto/magic-link"
import { errorHandler, Responses, schemaValidator, ValidationError } from "@jigjoy-io/serverless-core"

const cognito = new CognitoIdentityProviderClient()

const { FROM_ADDRESS, USER_POOL_ID, FRONTEND_APP_URL, SENDGRID_API_KEY } = process.env
const ONE_MIN = 60 * 1000
const TIMEOUT_MINS = 5


export async function sendMagicLinkHandler({ body }: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
	try {
		if (!body) 
			throw new ValidationError("No page body")

		const user: MagicLinkDTO = JSON.parse(body)
		const email = user.email

		schemaValidator(schema, user)

		console.log(`user: ${JSON.stringify(user)}`)

		try {
			const getUserCommand = new AdminGetUserCommand({
				Username: email,
				UserPoolId: USER_POOL_ID as string,
			})
			await cognito.send(getUserCommand)
		} catch (error: any) {
			switch (error.name) {
				case "UserNotFoundException":
					const createUserCommand = new AdminCreateUserCommand({
						Username: email,
						UserPoolId: USER_POOL_ID as string,
						MessageAction: "SUPPRESS",
					})
					await cognito.send(createUserCommand)
					break
			}
		}

		// only send the magic link on the first attempt
		const now = new Date()
		const expiration = new Date(now.getTime() + ONE_MIN * TIMEOUT_MINS)
		const payload = {
			email,
			expiration: expiration.toJSON(),
		}
		const tokenRaw = await encrypt(JSON.stringify(payload))
		const tokenB64 = Buffer.from(tokenRaw).toString("base64")
		const token = escape(tokenB64)
		const magicLink = `${FRONTEND_APP_URL}/workspace?email=${email}&token=${token}`

		const updateAttributesCommand = new AdminUpdateUserAttributesCommand({
			UserPoolId: USER_POOL_ID as string,
			Username: email,
			UserAttributes: [
				{
					Name: "custom:authChallenge",
					Value: tokenB64,
				},
			],
		})
		await cognito.send(updateAttributesCommand)

		let response = {
			statusCode: 202,
		}

		await sendEmail(email, magicLink)
		return Responses._202(response)
	} catch (error) {
		return errorHandler(error)
	}
}

async function sendEmail(emailAddress: string, magicLink: string) {
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
		let response = await sgMail.send(msg)
		// process data.
		return response
	} catch (error) {
		console.log(error)
		// error handling.
		return error
	}
}
