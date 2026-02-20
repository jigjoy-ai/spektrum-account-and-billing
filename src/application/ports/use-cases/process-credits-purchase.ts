export interface ProcessCreditsPurchaseUseCase {
    execute(creditAmount: number, organizationId: string, occuredAt: string):Promise<void>
}