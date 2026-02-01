import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { AuthSession } from "@domain/auth-session"
import { Account } from "@domain/account"
import { randomUUID } from "crypto"
import { UserIdentity } from "@domain/user-identity"

interface ChallengeData {
	email: string
	challenge: string
	expiresAt: Date
}

export class InMemoryIdentityManagementService implements IdentityManagementService {
	private users: Map<string, UserIdentity> = new Map()
	private challenges: Map<string, ChallengeData> = new Map()
	private accessTokens: Map<string, string> = new Map() // accessToken -> email
	private challengeCounter: number = 0

	// Failure injection flags
	private shouldFailOnHasUser: boolean = false
	private shouldFailOnCreateUser: boolean = false
	private shouldFailOnIssueAuthChallenge: boolean = false
	private shouldFailOnVerifyAuthChallenge: boolean = false
	private failureError: Error = new Error("Identity management service unavailable")

	async createUser(email: string): Promise<void> {
		if (this.shouldFailOnCreateUser) {
			throw this.failureError
		}
		// Only create user if it doesn't exist
		if (!this.users.has(email)) {
			const userId = randomUUID()
			this.users.set(email, UserIdentity.rehydrate(userId, email))
		}
	}

	async hasUser(email: string): Promise<boolean> {
		if (this.shouldFailOnHasUser) {
			throw this.failureError
		}
		return this.users.has(email)
	}

	async issueAuthChallenge(email: string, expirationInMinutes: number): Promise<string> {
		if (this.shouldFailOnIssueAuthChallenge) {
			throw this.failureError
		}

		const now = new Date()
		const expirationInMs = expirationInMinutes * 60 * 1000
		const expiresAt = new Date(now.getTime() + expirationInMs)

		const challenge = `challenge-${this.challengeCounter++}-${Date.now()}`
		const challengeB64 = Buffer.from(challenge).toString("base64")

		this.challenges.set(`${email}:${challengeB64}`, {
			email,
			challenge: challengeB64,
			expiresAt,
		})

		return challengeB64
	}

	async verifyAuthChallenge(email: string, challenge: string): Promise<AuthSession> {
		if (this.shouldFailOnVerifyAuthChallenge) {
			throw this.failureError
		}

		const challengeData = this.challenges.get(`${email}:${challenge}`)
		if (!challengeData) {
			throw new Error("Invalid challenge")
		}

		const isExpired = new Date() > challengeData.expiresAt
		if (isExpired) {
			throw new Error("Challenge expired")
		}

		// Return a session token or user identifier
		const accessToken = `session-${email}-${Date.now()}`
		// Store the mapping of access token to email
		this.accessTokens.set(accessToken, email)
		return AuthSession.create(accessToken, UserIdentity.rehydrate(email, email))
	}

	// Helper methods for testing
	getChallengeToken(email: string): string | undefined {
		// Get the most recent challenge for this email
		let latestChallenge: ChallengeData | undefined
		for (const [key, challengeData] of this.challenges.entries()) {
			if (challengeData.email === email) {
				if (!latestChallenge || challengeData.expiresAt > latestChallenge.expiresAt) {
					latestChallenge = challengeData
				}
			}
		}
		return latestChallenge?.challenge
	}

	async getCurrentUserFromAccessToken(accessToken: string): Promise<AuthSession> {
		// Look up the email from the stored access token mapping
		const email = this.accessTokens.get(accessToken)
		if (!email) {
			throw new Error("Invalid access token")
		}

		// Get user data to retrieve the UUID
		const account = this.users.get(email)
		if (!account) {
			throw new Error("Account not found")
		}

		// Return AuthSession with account
		return AuthSession.create(accessToken, account)
	}

	setShouldFailOnHasUser(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnHasUser = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnCreateUser(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnCreateUser = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnIssueAuthChallenge(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnIssueAuthChallenge = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnVerifyAuthChallenge(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnVerifyAuthChallenge = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	clear(): void {
		this.users.clear()
		this.challenges.clear()
		this.accessTokens.clear()
		this.challengeCounter = 0
		this.shouldFailOnHasUser = false
		this.shouldFailOnCreateUser = false
		this.shouldFailOnIssueAuthChallenge = false
		this.shouldFailOnVerifyAuthChallenge = false
		this.failureError = new Error("Identity management service unavailable")
	}
}
