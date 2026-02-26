export type Pagination = {
	pageNumber: number
	pageSize: number
}

export const DefaultPagination: Pagination = {
	pageNumber: 1,
	pageSize: 10,
}