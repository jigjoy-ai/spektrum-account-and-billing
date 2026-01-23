import { IdentityManagementService } from "@app/ports/services/identity-management-service"

export class InMemoryIdentityManagementService implements IdentityManagementService {
	private users: Set<string> = new Set()
	private authChallenges: Map<string, string> = new Map()
	private shouldFailOnCreateUser: boolean = false
	private shouldFailOnIsUserExists: boolean = false
	private shouldFailOnSetAuthToken: boolean = false
	private shouldFailOnVerifyAuthToken: boolean = false
	private failureError: Error = new Error("Identity management service unavailable")

	async createUser(email: string): Promise<void> {
		if (this.shouldFailOnCreateUser) {
			throw this.failureError
		}
		this.users.add(email)
	}

	async hasUser(email: string): Promise<boolean> {
		if (this.shouldFailOnIsUserExists) {
			throw this.failureError
		}
		return this.users.has(email)
	}

	async setAuthChallenge(email: string, challenge: string): Promise<void> {
		if (this.shouldFailOnSetAuthToken) {
			throw this.failureError
		}
		this.authChallenges.set(email, challenge)
	}

	async verifyAuthChallenge(email: string, challenge: string): Promise<void> {
		if (this.shouldFailOnVerifyAuthToken) {
			throw this.failureError
		}
		const storedToken = this.authChallenges.get(email)
		if (!storedToken || storedToken !== challenge) {
			throw new Error("Invalid auth challenge")
		}
	}

	getAuthToken(email: string): string | undefined {
		return this.authChallenges.get(email)
	}

	setShouldFailOnCreateUser(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnCreateUser = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnIsUserExists(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnIsUserExists = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnSetAuthToken(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnSetAuthToken = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	setShouldFailOnVerifyAuthToken(shouldFail: boolean, error?: Error): void {
		this.shouldFailOnVerifyAuthToken = shouldFail
		if (error) {
			this.failureError = error
		}
	}

	clear(): void {
		this.users.clear()
		this.authChallenges.clear()
		this.shouldFailOnCreateUser = false
		this.shouldFailOnIsUserExists = false
		this.shouldFailOnSetAuthToken = false
		this.shouldFailOnVerifyAuthToken = false
		this.failureError = new Error("Identity management service unavailable")
	}
}
