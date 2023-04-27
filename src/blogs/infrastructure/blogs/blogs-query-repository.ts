import { InjectModel } from "@nestjs/mongoose"
import { BlogsWithQueryOutputModel } from "../../application/dto/BlogViewModel"
import { BlogViewModel } from "../../application/dto/BlogViewModel"
import { ReadBlogsQueryParams } from "../../api/models/ReadBlogsQuery"
import { Blog } from "../../domain/blogs/BlogsSchema"
import { BlogModelType } from "../../domain/blogs/BlogsTypes"
import { Injectable } from '@nestjs/common'

@Injectable()
export class BlogsQueryRepository {
    constructor(@InjectModel(Blog.name) private BlogsModel: BlogModelType) { }

    async findBlogs(queryParams: ReadBlogsQueryParams, creatorId?: string | undefined): Promise<BlogsWithQueryOutputModel> {
        const {
            searchNameTerm = null,
            sortDirection = 'desc',
            sortBy = 'createdAt',
            pageNumber = 1,
            pageSize = 10
        } = queryParams

        const filter: any = {}
        if (searchNameTerm) {
            filter.name = {
                $regex: searchNameTerm, $options: 'i'
            }
        }
        if (creatorId) {
            filter.creatorId = creatorId
        }

        const totalCount = await this.BlogsModel.count(filter)
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize
        const sortDirectionNumber = sortDirection === 'asc' ? 1 : -1
        const resultedBlogs = await this.BlogsModel.find(filter, {
            _id: 0, __v: 0
        }).skip(skipCount).limit(+pageSize).sort({ [sortBy]: sortDirectionNumber }).lean()

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: resultedBlogs
        }
    }

    async findBlogById(id: string): Promise<BlogViewModel | null> {
        return this.BlogsModel.findOne({ id: id }, {
            _id: 0, creatorId: 0, __v: 0
        }).lean()
    }
}