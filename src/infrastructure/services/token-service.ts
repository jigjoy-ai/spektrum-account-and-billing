import { TokenService } from "@app/ports/services/token-service"
import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms"
import { escape } from "querystring"

export class KMSTokenService implements TokenService {

	private readonly ONE_MINUTE_IN_MS: number = 60 * 1000
    private readonly client: KMSClient

    constructor(private readonly kmsKeyId: string) {
        this.client = new KMSClient()
    }


	async generateToken(email: string, expirationInMinutes: number): Promise<string> {

        const now = new Date()
		const EXPIRATION_IN_MS = expirationInMinutes * this.ONE_MINUTE_IN_MS
		const expiresAt = new Date(now.getTime() + EXPIRATION_IN_MS)

		const payload = {
			email: email,
			expiration: expiresAt.toJSON(),
		}

        const tokenRaw = await this.encrypt(JSON.stringify(payload))
		const tokenB64 = Buffer.from(tokenRaw).toString("base64")

        return tokenB64
	}

    toUrlSafeToken(token: string): string {
        const urlSafeToken = escape(token)
        return urlSafeToken
    }

	async verifyToken(email: string, token: string): Promise<boolean> {
		// 2. Decrypt the expected challenge token
        const json = await this.decrypt(token)
        const payload = JSON.parse(json)

        // 3. Validate expiration and email
        const isExpired = new Date().toJSON() > payload.expiration
        return payload.email === email && !isExpired
	}

    private async encrypt(inpt: any): Promise<any> {
        const input = {
            KeyId: this.kmsKeyId,
            Plaintext: inpt,
        }

        const command = new EncryptCommand(input)
        const resp = await this.client.send(command)

        return resp.CiphertextBlob
    }

    private async decrypt(ciphertext: any): Promise<any> {
        const input = {
            CiphertextBlob: Buffer.from(ciphertext, "base64"),
        }

        const command = new DecryptCommand(input)
        const { Plaintext } = await this.client.send(command)
        const enc = new TextDecoder("utf-8")
        return enc.decode(Plaintext)
    }
}