import { processCreditsPurchase } from "@infra/dependencies"
import { createProcessCreditsPurchaseHandler } from "../factories/process-credits-purchase"


export const handler = createProcessCreditsPurchaseHandler(processCreditsPurchase)
