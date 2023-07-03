import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { BlogEntity } from "../../../domain/blogs/blog.entity"
import { Repository } from "typeorm"
import { BansUsersForBlogs } from "../../../domain/blogs/bans-users-for-blogs.entity"

@Injectable()
export class BlogsQueryTypeORMRepository {
    constructor(
        @InjectRepository(BlogEntity)
        private blogsRepository: Repository<BlogEntity>,
        @InjectRepository(BansUsersForBlogs)
        private bansUsersForBlogsRepository: Repository<BansUsersForBlogs>,
    ) { }

    async findBlogById(blogId: string): Promise<BlogEntity> {
        try {
            return this.blogsRepository.findOne({
                where: { id: blogId },
                relations: ['user']
            })
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findBanUserForBlogByBlogId(blogId: string): Promise<BansUsersForBlogs> {
        try {
            return this.bansUsersForBlogsRepository.findOne({ where: { blog: { id: blogId } } })
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findBanUserForBlogByUserIdAndBlogId(userId: string, blogId: string): Promise<BansUsersForBlogs> {
        try {
            return this.bansUsersForBlogsRepository.findOne({
                where: {
                    user: { id: userId },
                    blog: { id: blogId }
                }
            })
        } catch (err) {
            console.error(err)
            return null
        }
    }
}