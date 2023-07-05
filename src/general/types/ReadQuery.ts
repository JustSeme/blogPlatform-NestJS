import { SortDirectionToUpperCase } from "../decorators/toUpperCase.decorator"

export class ReadInputQuery {
    pageNumber: number
    pageSize: number
    sortBy: string
    @SortDirectionToUpperCase()
    sortDirection: 'ASC' | 'DESC'
}

export type ReadOutputQuery = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
}