export interface ProcessCreditsPurchaseUseCase {
    execute(creditAmount: number, email: string, occuredAt: string):Promise<void>
}