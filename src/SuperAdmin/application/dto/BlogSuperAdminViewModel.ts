import { BlogDTO } from "../../../Blogger/domain/blogs/BlogsTypes"

export type BlogsWithQuerySuperAdminOutputModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: BlogDTO[]
}