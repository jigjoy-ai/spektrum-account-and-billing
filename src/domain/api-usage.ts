import { v4 as uuidv4 } from "uuid"

export class ApiUsage {
	private constructor(
		private readonly id: string,
		private readonly apiKeyId: string,
		private readonly accountId: string,
		private readonly tokensSpent: number,
		private readonly pricePerToken: number,
		private readonly creditsSpentUsd: number,
		private readonly occurredAt: Date,
	) {}

	getId(): string {
		return this.id
	}

	getApiKeyId(): string {
		return this.apiKeyId
	}

	getAccountId(): string {
		return this.accountId
	}

	getTokensSpent(): number {
		return this.tokensSpent
	}

	getPricePerToken(): number {
		return this.pricePerToken
	}

	getCreditsSpentUsd(): number {
		return this.creditsSpentUsd
	}

	getOccurredAt(): Date {
		return this.occurredAt
	}

	static create(apiKeyId: string, accountId: string, tokensSpent: number, pricePerToken: number): ApiUsage {
		const creditsSpentUsd = tokensSpent * pricePerToken
		return new ApiUsage(uuidv4(), apiKeyId, accountId, tokensSpent, pricePerToken, creditsSpentUsd, new Date())
	}
}
