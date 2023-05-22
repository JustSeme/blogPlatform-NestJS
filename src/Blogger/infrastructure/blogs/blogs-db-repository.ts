import { BlogInputModel } from "../../api/models/BlogInputModel"
import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Blog } from "../../domain/blogs/BlogsSchema"
import {
    BlogBanInfoType,
    BlogDBModel, BlogModelType
} from "../../domain/blogs/BlogsTypes"
import { BlogDocument } from "./BlogsTypes"
import { ReadBlogsQueryParams } from "../../../blogs/api/models/ReadBlogsQuery"
import { BlogsWithQuerySuperAdminOutputModel } from "../../../SuperAdmin/application/dto/BlogSuperAdminViewModel"
import { BlogsWithQueryOutputModel } from "../../../blogs/application/dto/BlogViewModel"
import { BanBlogInputModel } from "../../../SuperAdmin/api/models/BanBlogInputModel"

@Injectable()
export class BlogsRepository {
    constructor(@InjectModel(Blog.name) private BlogsModel: BlogModelType) { }

    async deleteBlog(id: string | null) {
        let result
        if (id === null) {
            result = await this.BlogsModel.deleteMany({})
            return result.deletedCount > 0
        }

        result = await this.BlogsModel.deleteOne({ id: id })
        return result.deletedCount === 1
    }

    async createBlog(createdBlog: BlogDBModel) {
        await this.BlogsModel.create(createdBlog)
    }

    async updateBlog(id: string, body: BlogInputModel) {
        const result = await this.BlogsModel.updateOne({ id: id }, {
            name: body.name, description: body.description, websiteUrl: body.websiteUrl
        })

        return result.matchedCount === 1
    }

    async findBlogById(id: string): Promise<BlogDocument | null> {
        return this.BlogsModel.findOne({ id: id })
    }

    async isBlogExist(blogId: string): Promise<boolean> {
        const blogById = await this.findBlogById(blogId)
        return blogById ? true : false
    }

    async save(blog: BlogDocument) {
        await blog.save()
    }

    async bindBlogWithUser(blogId: string, userId: string, userLogin: string) {
        const blogById = await this.findBlogById(blogId)
        blogById.blogOwnerInfo.userId = userId
        blogById.blogOwnerInfo.userLogin = userLogin
        await this.save(blogById)
    }

    async findBlogs(queryParams: ReadBlogsQueryParams, creatorId?: string | undefined): Promise<BlogsWithQueryOutputModel> {
        const {
            searchNameTerm = null,
            sortDirection = 'desc',
            sortBy = 'createdAt',
            pageNumber = 1,
            pageSize = 10
        } = queryParams

        const filter: any = { 'banInfo.isBanned': false }
        if (searchNameTerm) {
            filter.name = {
                $regex: searchNameTerm, $options: 'i'
            }
        }
        if (creatorId) {
            filter['blogOwnerInfo.userId'] = creatorId
        }

        const totalCount = await this.BlogsModel.count(filter)
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize
        const sortDirectionNumber = sortDirection === 'asc' ? 1 : -1
        const resultedBlogs = await this.BlogsModel.find(filter, {
            _id: 0, 'blogOwnerInfo': 0, banInfo: 0, __v: 0
        }).skip(skipCount).limit(+pageSize).sort({ [sortBy]: sortDirectionNumber }).lean()

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: resultedBlogs
        }
    }

    async findBlogsForSuperAdmin(queryParams: ReadBlogsQueryParams, creatorId?: string | undefined): Promise<BlogsWithQuerySuperAdminOutputModel> {
        const {
            searchNameTerm = null,
            sortDirection = 'desc',
            sortBy = 'createdAt',
            pageNumber = 1,
            pageSize = 10
        } = queryParams

        const filter: any = { 'banInfo.isBanned': false }
        if (searchNameTerm) {
            filter.name = {
                $regex: searchNameTerm, $options: 'i'
            }
        }
        if (creatorId) {
            filter['blogOwnerInfo.userId'] = creatorId
        }

        const totalCount = await this.BlogsModel.count(filter)
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize
        const sortDirectionNumber = sortDirection === 'asc' ? 1 : -1
        const resultedBlogs = await this.BlogsModel.find(filter, {
            _id: 0, 'blogOwnerInfo._id': 0, __v: 0
        }).skip(skipCount).limit(+pageSize).sort({ [sortBy]: sortDirectionNumber }).lean()

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: resultedBlogs
        }
    }

    async updateBanBlog(blogId: string, banInputModel: BanBlogInputModel): Promise<boolean> {
        const banInfo: BlogBanInfoType = {
            isBanned: banInputModel.isBanned,
            banDate: new Date()
        }

        const isUpdatedData = await this.BlogsModel.updateOne({ id: blogId }, { banInfo: banInfo })
        return isUpdatedData.matchedCount === 1
    }
}