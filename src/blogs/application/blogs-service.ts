import { BlogInputModel } from "../api/models/BlogInputModel"
import { BlogViewModel } from "./dto/BlogViewModel"
import { BlogsRepository } from "../infrastructure/blogs/blogs-db-repository"
import { Injectable } from "@nestjs/common"
import { BlogDBModel } from "../domain/blogs/BlogsTypes"

@Injectable()
export class BlogsService {
    constructor(protected blogsRepository: BlogsRepository) { }

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