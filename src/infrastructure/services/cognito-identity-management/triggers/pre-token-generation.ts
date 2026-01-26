import { PreTokenGenerationTriggerEvent } from "aws-lambda"

export async function preTokenGenerationHandler(
	event: PreTokenGenerationTriggerEvent,
): Promise<PreTokenGenerationTriggerEvent> {
	console.log(
		"PreTokenGeneration - Trigger called",
		JSON.stringify({
			triggerSource: event.triggerSource,
			hasEmail: !!event.request.userAttributes.email,
			email: event.request.userAttributes.email,
		}),
	)

	// Add email to access token claims
	// According to AWS docs, claimsToAddOrOverride should work for access tokens
	if (event.request.userAttributes.email) {
		event.response.claimsOverrideDetails = {
			claimsToAddOrOverride: {
				email: event.request.userAttributes.email,
			},
		}

		console.log("PreTokenGeneration - Added email to claims", event.request.userAttributes.email)
	}

	return event
}
