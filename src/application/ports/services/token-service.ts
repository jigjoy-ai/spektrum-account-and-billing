export interface TokenService {
	generateToken(email: string, expirationInMinutes: number): Promise<string>
    toUrlSafeToken(token: string): string
	verifyToken(email: string, token: string): Promise<boolean>
}