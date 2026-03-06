import { AuthSession } from "@domain/auth-session"
import { AuthSessionDTO } from "@infra/http/dtos/auth-session"

export class AuthSessionMapper {
	static toDTO(authSession: AuthSession): AuthSessionDTO {
		return {
			accessToken: authSession.getAccessToken(),
			userData: {
				id: authSession.getUserId(),
				organizationId: authSession.getOrganization().getId(),
				email: authSession.getUserEmail(),
				credits: authSession.getOrganization().getRemainingCredits(),
				apiKeys: authSession.getApiKeys().map((apiKey) => ({
					id: apiKey.getId(),
					name: apiKey.getName(),
					displayKey: apiKey.getDisplayKey(),
				})),
			},
		} as AuthSessionDTO
	}
}
