import { BlogInputModel } from "../api/models/BlogInputModel"
import { BlogViewModel } from "./dto/BlogViewModel"
import { BlogsRepository } from "../infrastructure/blogs/blogs-db-repository"
import {
    Injectable, Inject
} from "@nestjs/common"
import { BlogDBModel } from "../domain/blogs/BlogsTypes"
import { getConnectionToken } from "@nestjs/mongoose"
import * as Mongoose from "mongoose"

@Injectable()
export class BlogsService {
    constructor(@Inject(getConnectionToken()) private connection: Mongoose.Connection,
        protected blogsRepository: BlogsRepository
    ) { }

    async getMongoConnection() {
        return this.connection
    }

    async deleteBlog(id: string) {
        return this.blogsRepository.deleteBlog(id)
    }

    async createBlog(body: BlogInputModel): Promise<BlogViewModel> {
        const createdBlog: BlogViewModel = new BlogDBModel(body.name, body.description, body.websiteUrl, false)

        await this.blogsRepository.createBlog(createdBlog)

        return createdBlog
    }

    async updateBlog(id: string, body: BlogInputModel) {
        return await this.blogsRepository.updateBlog(id, body)
    }
}