import { AWSKeyManagementService } from "@infra/services/cognito-identity-management/util/aws-key-management-service"
import { VerifyAuthChallengeResponseTriggerEvent } from "aws-lambda"

export async function verifyAuthChallengeResponseHandler(event: VerifyAuthChallengeResponseTriggerEvent): Promise<VerifyAuthChallengeResponseTriggerEvent> {
	const email = event.request.userAttributes.email
	const privateChallengeParams = event.request.privateChallengeParameters || {}
	const expected = privateChallengeParams.challenge
	const answer = event.request.challengeAnswer

	console.log("VerifyAuthChallengeResponse - Email:", email)

	// Check if challenge is missing
	if (!expected || expected === "") {
		console.error("VerifyAuthChallengeResponse - custom:authChallenge attribute was not set or CreateAuthChallenge did not run properly")
		event.response.answerCorrect = false
		return event
	}

	// 1. Validate challenge token matches what was sent
	if (answer !== expected) {
		console.log("Token mismatch - Answer does not match expected challenge")
		event.response.answerCorrect = false
		return event
	}

	const KMS_KEY_ID = process.env.KMS_KEY_ID as string
	if (!KMS_KEY_ID) {
		console.error("KMS_KEY_ID environment variable is not set")
		event.response.answerCorrect = false
		return event
	}

	const awsKeyManagementService = new AWSKeyManagementService(KMS_KEY_ID)

	let isValid = false
	try {
		// 2. Decrypt the expected challenge token
		const json = await awsKeyManagementService.decrypt(answer)
		const payload = JSON.parse(json)

		console.log("Decrypted payload - Email:", payload.email, "Expiration:", payload.expiration)

		// 3. Validate expiration and email
		const now = new Date().toJSON()
		const isExpired = now > payload.expiration
		const emailMatches = payload.email === email
		
		console.log("Validation - Email matches:", emailMatches, "Is expired:", isExpired, "Current time:", now)
		
		isValid = emailMatches && !isExpired
	} catch (error) {
		console.error("Error decrypting challenge token", error)
		// If decryption fails (invalid token, wrong key, etc.), return false
		isValid = false
	}

	if (isValid) {
		console.log("Challenge verification successful")
		event.response.answerCorrect = true
	} else {
		console.log("Challenge verification failed - Invalid token")
		event.response.answerCorrect = false
	}

	return event
}
