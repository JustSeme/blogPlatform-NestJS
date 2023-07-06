import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BansUsersForBlogs } from "../../../domain/blogs/typeORM/bans-users-for-blogs.entity"
import { BlogEntity } from "../../../domain/blogs/typeORM/blog.entity"
import { ReadBlogsQueryParams } from "../../../../blogs/api/models/ReadBlogsQuery"
import {
    BlogViewModel, BlogsWithQueryOutputModel
} from "../../../../blogs/application/dto/BlogViewModel"

@Injectable()
export class BlogsQueryTypeORMRepository {
    constructor(
        @InjectRepository(BlogEntity)
        private blogsRepository: Repository<BlogEntity>,
        @InjectRepository(BansUsersForBlogs)
        private bansUsersForBlogsRepository: Repository<BansUsersForBlogs>,
    ) { }

    async findBlogs(queryParams: ReadBlogsQueryParams): Promise<BlogsWithQueryOutputModel> {
        const {
            searchNameTerm = '',
            sortDirection = 'DESC',
            sortBy = 'createdAt',
            pageNumber = 1,
            pageSize = 10
        } = queryParams

        const nameTerm = `%${searchNameTerm.toLocaleLowerCase()}%`

        const totalCount = await this.blogsRepository
            .createQueryBuilder('be')
            .where('lower(be.name) LIKE :nameTerm', { nameTerm })
            .andWhere('be.isBanned = false')
            .getCount()

        const pagesCount = Math.ceil(totalCount / +pageSize)
        const skipCount = (+pageNumber - 1) * +pageSize

        const resultedBlogs = await this.blogsRepository
            .createQueryBuilder('be')
            .where('lower(be.name) LIKE :nameTerm', { nameTerm })
            .andWhere('be.isBanned = false')
            .orderBy(`be.${sortBy}`, sortDirection)
            .limit(pageSize)
            .offset(skipCount)
            .getMany()

        const displayedBlogs = resultedBlogs.map(blog => new BlogViewModel(blog))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: displayedBlogs
        }
    }

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