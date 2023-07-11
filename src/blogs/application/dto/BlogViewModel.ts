import { BlogDBModel } from "../../../Blogger/domain/blogs/BlogsTypes"
import { BlogEntity } from "../../../Blogger/domain/blogs/typeORM/blog.entity"

export class BlogViewModel {
    public id: string
    public createdAt: Date
    public name: string
    public description: string
    public websiteUrl: string
    public isMembership: boolean

    constructor(
        rawBlog: BlogDBModel | BlogViewModel | BlogEntity
    ) {
        this.id = rawBlog.id
        this.createdAt = rawBlog.createdAt
        this.name = rawBlog.name
        this.description = rawBlog.description
        this.websiteUrl = rawBlog.websiteUrl
        this.isMembership = rawBlog.isMembership
    }
}

export type BlogsWithQueryOutputModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: BlogViewModel[]
}