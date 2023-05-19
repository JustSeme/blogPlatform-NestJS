export type OutputData<T> = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: Array<T>
}