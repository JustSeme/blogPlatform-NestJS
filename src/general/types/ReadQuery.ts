export type ReadInputQuery = {
    pageNumber: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}

export type ReadOutputQuery = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
}