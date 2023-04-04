import { InjectModel } from "@nestjs/mongoose"
import { BlogsWithQueryOutputModel } from "../../api/models/BlogViewModel"
import { BlogViewModel } from "../../api/models/BlogViewModel"
import { ReadBlogsQueryParams } from "../../api/models/ReadBlogsQuery"
import { Blog } from "../../domain/blogs/BlogsSchema"
import { BlogModelType } from "../../domain/blogs/BlogsTypes"

export class BlogsQueryRepository {
    constructor(@InjectModel(Blog.name) private BlogsModel: BlogModelType) { }

    async findBlogs(queryParams: ReadBlogsQueryParams): Promise<BlogsWithQueryOutputModel> {
        const {
            searchNameTerm = null,
            sortDirection = 'desc',
            sortBy = 'createdAt',
            pageNumber = 1,
            pageSize = 10
        } = queryParams

        const filter: any = {}
        if (searchNameTerm) {
            filter.name = { $regex: searchNameTerm, $options: 'i' }
        }

        const totalCount = await this.BlogsModel.count(filter)
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize
        const sortDirectionNumber = sortDirection === 'asc' ? 1 : -1
        const resultedBlogs = await this.BlogsModel.find(filter, { _id: 0, __v: 0 }).skip(skipCount).limit(+pageSize).sort({ [sortBy]: sortDirectionNumber }).lean()

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: resultedBlogs
        }
    }

    async findBlogById(id: string): Promise<BlogViewModel | null> {
        return await this.BlogsModel.findOne({ id: id }, { _id: 0, __v: 0 }).lean()
    }
}