import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BansUsersForBlogs } from "../../../domain/blogs/typeORM/bans-users-for-blogs.entity"
import { BlogEntity } from "../../../domain/blogs/typeORM/blog.entity"
import { ReadBlogsQueryParams } from "../../../../blogs/api/models/ReadBlogsQuery"
import {
    BlogViewModel, BlogsWithQueryOutputModel
} from "../../../../blogs/application/dto/BlogViewModel"
import { BlogsWithQuerySuperAdminOutputModel } from "../../../../SuperAdmin/application/dto/BlogSuperAdminViewModel"
import { BlogDBModel } from "../../../domain/blogs/BlogsTypes"

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

        let resultedBlogs

        try {
            resultedBlogs = await this.blogsRepository
                .createQueryBuilder('be')
                .where('lower(be.name) LIKE :nameTerm', { nameTerm })
                .andWhere('be.isBanned = false')
                .orderBy(`be.${sortBy}`, sortDirection)
                .limit(pageSize)
                .offset(skipCount)
                .getMany()

        } catch (err) {
            console.error(err)
            throw new Error('Something wrong with database...')
        }

        const displayedBlogs = resultedBlogs.map(blog => new BlogViewModel(blog))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: displayedBlogs
        }
    }

    async findBlogsForBlogger(queryParams: ReadBlogsQueryParams, creatorId: string): Promise<BlogsWithQueryOutputModel> {
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
            .leftJoin('be.user', 'bu')
            .where('lower(be.name) LIKE :nameTerm', { nameTerm })
            .andWhere('be.isBanned = false')
            .andWhere('bu.id = :creatorId', { creatorId })
            .getCount()

        const pagesCount = Math.ceil(totalCount / +pageSize)
        const skipCount = (+pageNumber - 1) * +pageSize

        let resultedBlogs

        try {
            resultedBlogs = await this.blogsRepository
                .createQueryBuilder('be')
                .leftJoin('be.user', 'bu')
                .where('lower(be.name) LIKE :nameTerm', { nameTerm })
                .andWhere('be.isBanned = false')
                .andWhere('bu.id = :creatorId', { creatorId })
                .orderBy(`be.${sortBy}`, sortDirection)
                .limit(pageSize)
                .offset(skipCount)
                .getMany()

        } catch (err) {
            console.error(err)
            throw new Error('Something wrong with database...')
        }

        const displayedBlogs = resultedBlogs.map(blog => new BlogViewModel(blog))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: displayedBlogs
        }
    }

    async findBlogsForSuperAdmin(queryParams: ReadBlogsQueryParams): Promise<BlogsWithQuerySuperAdminOutputModel> {
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
            .getCount()

        const pagesCount = Math.ceil(totalCount / +pageSize)
        const skipCount = (+pageNumber - 1) * +pageSize

        let resultedBlogs

        try {
            resultedBlogs = await this.blogsRepository
                .createQueryBuilder('be')
                .leftJoinAndSelect('be.user', 'bu')
                .where('lower(be.name) LIKE :nameTerm', { nameTerm })
                .orderBy(`be.${sortBy}`, sortDirection)
                .limit(pageSize)
                .offset(skipCount)
                .getMany()

        } catch (err) {
            console.error(err)
            throw new Error('Something wrong with database...')
        }

        const displayedBlogs = resultedBlogs.map(blog => new BlogDBModel(blog))

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
            const findedBlog = await this.blogsRepository.findOne({
                where: { id: blogId },
                relations: ['user']
            })

            return findedBlog ? findedBlog : null
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findOnlyUnbannedBlogById(blogId: string): Promise<BlogEntity> {
        try {
            const findedBlog = await this.blogsRepository.findOne({
                where: {
                    id: blogId,
                    isBanned: false
                },
                relations: { user: true }
            })

            return findedBlog ? findedBlog : null
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findBanUserForBlogByBlogId(blogId: string, userId: string): Promise<BansUsersForBlogs> {
        try {
            return this.bansUsersForBlogsRepository.findOne({
                where: {
                    blog: { id: blogId },
                    user: { id: userId }
                }
            })
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
            const blogByBlogId = await this.blogsRepository.findOne({ where: { id: blogId } })

            return blogByBlogId ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }
}