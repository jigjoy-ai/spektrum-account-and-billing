import { TokenService } from "@app/ports/services/token-service"
import { escape } from "querystring"

interface TokenData {
	email: string
	token: string
	expiresAt: Date
}

export class InMemoryTokenService implements TokenService {
	private tokens: Map<string, TokenData> = new Map()
	private tokenCounter: number = 0
	private shouldFailOnGenerateToken: boolean = false
	private shouldFailOnVerifyToken: boolean = false
	private failureError: Error = new Error("Token service unavailable")

	async generateToken(email: string, expirationInMinutes: number): Promise<string> {
		if (this.shouldFailOnGenerateToken) {
			throw this.failureError
		}

		const now = new Date()
		const expirationInMs = expirationInMinutes * 60 * 1000
		const expiresAt = new Date(now.getTime() + expirationInMs)

		const token = `token-${this.tokenCounter++}-${Date.now()}`
		const tokenB64 = Buffer.from(token).toString("base64")

		this.tokens.set(tokenB64, {
			email,
			token: tokenB64,
			expiresAt,
		})

		return tokenB64
	}

	toUrlSafeToken(token: string): string {
		return escape(token)
	}

	async verifyToken(email: string, token: string): Promise<boolean> {
		if (this.shouldFailOnVerifyToken) {
			throw this.failureError
		}

		const tokenData = this.tokens.get(token)
		if (!tokenData) {
			return false
		}

		const isExpired = new Date() > tokenData.expiresAt
		return tokenData.email === email && !isExpired
	}

	// Helper methods for testing
	setShouldFailOnGenerateToken(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnGenerateToken = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnVerifyToken(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnVerifyToken = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	clear(): void {
		this.tokens.clear()
		this.tokenCounter = 0
		this.shouldFailOnGenerateToken = false
		this.shouldFailOnVerifyToken = false
		this.failureError = new Error("Token service unavailable")
	}

	getTokenData(token: string): TokenData | undefined {
		return this.tokens.get(token)
	}
}
