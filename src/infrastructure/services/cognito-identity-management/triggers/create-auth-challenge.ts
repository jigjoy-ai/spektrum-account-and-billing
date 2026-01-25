export async function createAuthChallengeHandler(event: any) {
	const email = event.request.userAttributes.email
	const authChallenge = event.request.userAttributes["custom:authChallenge"]

	console.log("CreateAuthChallenge - Email:", email)
	console.log("CreateAuthChallenge - custom:authChallenge present:", !!authChallenge)
	console.log("CreateAuthChallenge - custom:authChallenge length:", authChallenge?.length)
	console.log("CreateAuthChallenge - All user attributes:", Object.keys(event.request.userAttributes))

	if (!authChallenge || authChallenge === "") {
		console.error("CreateAuthChallenge - ERROR: custom:authChallenge attribute is missing or empty!")
		console.error("CreateAuthChallenge - This means issueAuthChallenge was not called or the attribute was not saved properly")
		// Still set it to empty string so VerifyAuthChallengeResponse can detect the issue
		event.response.privateChallengeParameters = {
			challenge: "",
		}
	} else {
		// the verify step would decrypt this and check the user's answer
		event.response.privateChallengeParameters = {
			challenge: authChallenge,
		}
	}

	event.response.publicChallengeParameters = {
		email: email,
	}

	return event
}
