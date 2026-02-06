import { AuthSession } from "@domain/auth-session"
import { AuthSessionDTO } from "../dtos/auth-session"

export class AuthSessionMapper {
	static toDTO(authSession: AuthSession): AuthSessionDTO {
		return {
			accessToken: authSession.getAccessToken(),
			userData: {
				id: authSession.getAccount().getId(),
				email: authSession.getAccount().getRootEmail(),
				credits: authSession.getAccount().getRemainingCredits(),
				apiKeys: authSession.getApiKeys().map(apiKey => ({
					id: apiKey.getId(),
					name: apiKey.getName(),
					key: apiKey.getSecretKey(),
				})),
			},
        } as AuthSessionDTO
	}
}