import { BlogInputModel } from "./dto/BlogInputModel"
import { BlogViewModel } from "../api/models/BlogViewModel"
import { BlogsRepository } from "../infrastructure/blogs-db-repository"
import { Injectable } from "@nestjs/common"
import { BlogDBModel } from "../domain/BlogsTypes"

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