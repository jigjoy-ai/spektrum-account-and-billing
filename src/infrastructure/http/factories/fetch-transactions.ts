import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { Responses, ValidationError } from "@jigjoy-ai/serverless-core"
import { FetchTransactionsParams, FetchTransactionsUseCase } from "@app/ports/use-cases/fetch-transactions"
import { extractAuthData } from "@heksagon/http"
import { UserData } from "@jigjoy-ai/auth"
import { Auth } from "@heksagon/app"
import { PaginatedResult } from "@app/value-objects/pagination"
import { Transaction } from "@domain/transaction"
import { TransactionDTO } from "../dtos/transaction"
import { TransactionMapper } from "../mappers/transaction-mapper"

export function createFetchTransactionsHandler(fetchTransactions: FetchTransactionsUseCase) {
	return async function createFetchTransactionsHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
			const auth: Auth<UserData> = extractAuthData(event.headers)

            const queryParams = event.queryStringParameters
    
            if (!queryParams) {
                throw new ValidationError("No query parameters")
            }

            let pageNumber: number
            let pageSize: number

            try {
                pageNumber = parseInt(queryParams?.pageNumber ?? '1')
                pageSize = parseInt(queryParams?.pageSize ?? '10')
            } catch (error) {
                throw new ValidationError("Invalid pagination query parameters")
            }
    
            
			const params: FetchTransactionsParams = {
				pagination: {
					pageNumber: pageNumber,
					pageSize: pageSize,
				},
			}

			const result: PaginatedResult<Transaction> = await fetchTransactions.execute(auth, params)
            const transactions: TransactionDTO[] = TransactionMapper.toDtos(result.items)
            const paginatedResult: PaginatedResult<TransactionDTO> = {
                items: transactions,
                pagination: {
                    pageNumber: result.pagination.pageNumber,
                    pageSize: result.pagination.pageSize,
                    totalPages: result.pagination.totalPages,
                    totalItems: result.pagination.totalItems,
                },
            }

			return Responses._200(paginatedResult)
	}
}
