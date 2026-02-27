export type Pagination = {
	pageNumber: number
	pageSize: number
}

export const DefaultPagination: Pagination = {
	pageNumber: 1,
	pageSize: 10,
}

export type PaginatedResult<T> = {
	items: T[]
	pagination: {
		pageNumber: number
		pageSize: number
		totalPages: number
		totalItems: number
	}
}