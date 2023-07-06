import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BansUsersForBlogs } from "../../../domain/blogs/typeORM/bans-users-for-blogs.entity"
import { BlogEntity } from "../../../domain/blogs/typeORM/blog.entity"

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

    async isBlogExists(blogId: string): Promise<boolean> {
        try {
            const blogByBlogId = await this.blogsRepository.find({ where: { id: blogId } })

            return blogByBlogId ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }
}