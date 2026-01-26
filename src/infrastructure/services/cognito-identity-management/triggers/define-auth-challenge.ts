import { DefineAuthChallengeTriggerEvent } from "aws-lambda"

export async function defineAuthChallengeHandler(
	event: DefineAuthChallengeTriggerEvent,
): Promise<DefineAuthChallengeTriggerEvent> {
	if (event.request.userNotFound) {
		event.response.issueTokens = false
		event.response.failAuthentication = true
		return event
	}

	const session = event.request.session

	if (!session || session.length === 0) {
		// Issue new challenge
		event.response.issueTokens = false
		event.response.failAuthentication = false

		// This will trigger createAuthChallengeHandler
		event.response.challengeName = "CUSTOM_CHALLENGE"
	} else {
		const lastAttempt = session[session.length - 1]

		if (lastAttempt.challengeResult === true) {
			// User gave right answer
			event.response.issueTokens = true
			event.response.failAuthentication = false
		} else {
			// User gave wrong answer
			event.response.issueTokens = false
			event.response.failAuthentication = true
		}
	}

	return event
}
