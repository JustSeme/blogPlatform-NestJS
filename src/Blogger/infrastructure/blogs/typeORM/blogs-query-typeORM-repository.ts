import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { BlogEntity } from "../../../domain/blogs/blog.entity"
import { Repository } from "typeorm"

@Injectable()
export class BlogsQueryTypeORMRepository {
    constructor(
        @InjectRepository(BlogEntity)
        private blogsRepository: Repository<BlogEntity>
    ) { }

    async findBlogById(blogId: string): Promise<BlogEntity> {
        try {
            return this.blogsRepository.findOneBy({ id: blogId })
        } catch (err) {
            console.error(err)
            return null
        }
    }
}