import { BlogDBModel } from "../../../blogs/domain/blogs/BlogsTypes"

export type BlogsWithQuerySuperAdminOutputModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: BlogDBModel[]
}