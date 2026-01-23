import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms"

export class AWSKeyManagementService {

    private readonly client: KMSClient

    constructor(private readonly kmsKeyId: string) {
        this.client = new KMSClient()
    }

    async encrypt(inpt: any): Promise<any> {
        const input = {
            KeyId: this.kmsKeyId,
            Plaintext: inpt,
        }

        const command = new EncryptCommand(input)
        const resp = await this.client.send(command)

        return resp.CiphertextBlob
    }

    async decrypt(ciphertext: any): Promise<any> {
        const input = {
            CiphertextBlob: Buffer.from(ciphertext, "base64"),
        }

        const command = new DecryptCommand(input)
        const { Plaintext } = await this.client.send(command)
        const enc = new TextDecoder("utf-8")
        return enc.decode(Plaintext)
    }
}