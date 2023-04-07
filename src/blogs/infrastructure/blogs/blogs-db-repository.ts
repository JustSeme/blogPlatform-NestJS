import { BlogInputModel } from "../../api/models/BlogInputModel"
import { BlogViewModel } from "../../application/dto/BlogViewModel"
import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Blog } from "../../domain/blogs/BlogsSchema"
import { BlogModelType } from "../../domain/blogs/BlogsTypes"

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

    async createBlog(createdBlog: BlogViewModel) {
        await this.BlogsModel.create(createdBlog)
    }

    async updateBlog(id: string, body: BlogInputModel) {
        const result = await this.BlogsModel.updateOne({ id: id }, {
            name: body.name, description: body.description, websiteUrl: body.websiteUrl
        })

        return result.matchedCount === 1
    }

    async findBlogById(id: string): Promise<BlogViewModel | null> {
        return await this.BlogsModel.findOne({ id: id }, {
            _id: 0, __v: 0
        })
    }
}