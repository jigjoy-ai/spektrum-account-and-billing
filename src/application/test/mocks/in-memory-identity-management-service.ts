import { IdentityManagementService } from "@app/ports/services/identity-management-service"
import { User } from "@domain/user"
import { v4 as uuidv4 } from 'uuid'

interface ChallengeData {
	email: string
	challenge: string
	expiresAt: Date
}

export class InMemoryIdentityManagementService implements IdentityManagementService {
	private users: Map<string, User> = new Map()
	private challenges: Map<string, ChallengeData> = new Map()
	private accessTokens: Map<string, string> = new Map() // accessToken -> email
	private challengeCounter: number = 0

	// Failure injection flags
	private shouldFailOnHasUser: boolean = false
	private shouldFailOnGet: boolean = false
	private shouldFailOnCreateUser: boolean = false
	private shouldFailOnIssueAuthChallenge: boolean = false
	private shouldFailOnVerifyAuthChallenge: boolean = false
	private failureError: Error = new Error("Identity management service unavailable")

	async create(email: string): Promise<User> {
		if (this.shouldFailOnCreateUser) {
			throw this.failureError
		}
		// Only create user if it doesn't exist
		let user = User.rehydrate(uuidv4(), email)
		if (!this.users.has(email)) {
			this.users.set(email, user)
		}
		return user
	}

	async exists(email: string): Promise<boolean> {
		if (this.shouldFailOnHasUser) {
			throw this.failureError
		}
		return this.users.has(email)
	}

	async get(email: string): Promise<User | null> {
		if (this.shouldFailOnGet) {
			throw this.failureError
		}
		return this.users.get(email) ?? null
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

	async verifyAuthChallenge(email: string, challenge: string): Promise<string> {
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
		return accessToken
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

	setShouldFailOnGet(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnGet = shouldFail
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
		this.shouldFailOnGet = false
		this.shouldFailOnCreateUser = false
		this.shouldFailOnIssueAuthChallenge = false
		this.shouldFailOnVerifyAuthChallenge = false
		this.failureError = new Error("Identity management service unavailable")
	}
}
