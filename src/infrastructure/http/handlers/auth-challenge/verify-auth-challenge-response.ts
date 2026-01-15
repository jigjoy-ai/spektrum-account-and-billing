import { KMSTokenService } from "@infra/services/token-service"

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
	const tokenService = new KMSTokenService(KMS_KEY_ID)
	// 2. Decrypt the expected challenge token
	const json = await decrypt(answer)
	const payload = JSON.parse(json)

	// 3. Validate expiration and email
	const isExpired = new Date().toJSON() > payload.expiration
	if (payload.email === email && !isExpired) {
		event.response.answerCorrect = true
	} else {
		console.log("Token expired or email mismatch")
		event.response.answerCorrect = false
	}

	return event
}
