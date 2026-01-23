import { AWSKeyManagementService } from "@infra/services/cognito-identity-management/util/aws-key-management-service"

export async function verifyAuthChallengeResponseHandler(event: any) {
	const email = event.request.userAttributes.email
	const expected = event.request.privateChallengeParameters.challenge
	const answer = event.request.challengeAnswer

	// 1. Validate challenge token matches what was sent
	if (answer !== expected) {
		console.log("Token mismatch")
		event.response.answerCorrect = false
		return event
	}

	const KMS_KEY_ID = process.env.KMS_KEY_ID as string
	const awsKeyManagementService = new AWSKeyManagementService(KMS_KEY_ID)

	let isValid = false
	try {
		// 2. Decrypt the expected challenge token
		const json = await awsKeyManagementService.decrypt(answer)
		const payload = JSON.parse(json)

		// 3. Validate expiration and email
		const isExpired = new Date().toJSON() > payload.expiration
		isValid = payload.email === email && !isExpired
	} catch (error) {
		console.error("Error decrypting challenge token", error)
		// If decryption fails (invalid token, wrong key, etc.), return false
		isValid = false
	}

	if (isValid) {
		event.response.answerCorrect = true
	} else {
		console.log("Invalid token")
		event.response.answerCorrect = false
	}

	return event
}
