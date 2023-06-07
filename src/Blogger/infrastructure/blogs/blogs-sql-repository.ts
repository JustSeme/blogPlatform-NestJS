import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import {
    BlogDBModel, BlogDTO, BlogSQLModel
} from '../../domain/blogs/BlogsTypes'
import { BlogInputModel } from '../../api/models/BlogInputModel'
import { BanBlogInputModel } from '../../../SuperAdmin/api/models/BanBlogInputModel'

@Injectable()
export class BlogsSQLRepository {
    constructor(private dataSource: DataSource) { }

    async createBlog(newBlog: BlogDTO): Promise<BlogDBModel> {
        const queryString = `
            INSERT INTO public.blog_entity
                ("name", description, "websiteUrl", "isMembership", "ownerId", "ownerLogin", "isBanned", "banDate")
                VALUES($1, $2, $3, $4, $5, $6, $7, $8);
        `

        try {
            const createdBlog: BlogSQLModel = await this.dataSource.query(queryString, [
                newBlog.name,
                newBlog.description,
                newBlog.websiteUrl,
                newBlog.isMembership,
                newBlog.blogOwnerInfo.userId,
                newBlog.blogOwnerInfo.userLogin,
                newBlog.banInfo.isBanned,
                newBlog.banInfo.banDate
            ])

            if (!createdBlog[0]) {
                return null
            }

            return new BlogDBModel(createdBlog)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async updateBlog(id: string, body: BlogInputModel): Promise<boolean> {
        const queryString = `
            UPDATE public.blog_entity
                SET "name"=$2, description=$3, "websiteUrl"=$4
                WHERE id=$1;
        `

        try {
            await this.dataSource.query(queryString, [id, body.name, body.description, body.websiteUrl])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async findBlogById(blogId: string): Promise<BlogDBModel> {
        const queryString = `
            SELECT *
                FROM public."blog_entity"
                WHERE id=$1 AND "isBanned"=false
        `

        try {
            const findedBlogData: BlogSQLModel = await this.dataSource.query(queryString, [blogId])

            if (!findedBlogData[0]) {
                return null
            }

            return new BlogDBModel(findedBlogData[0])
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async isBlogExists(blogId: string): Promise<boolean> {
        const blogById = await this.findBlogById(blogId)
        return blogById ? true : false
    }

    async bindBlogWithUser(blogId: string, newOwnerId: string, newOwnerLogin: string): Promise<boolean> {
        const queryString = `
            UPDATE public.blog_entity
                SET "ownerId"=$2, "ownerLogin"=$3
                WHERE id=$1;
        `

        try {
            await this.dataSource.query(queryString, [blogId, newOwnerId, newOwnerLogin])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async findAllBlogIdsByCreatorId(creatorId: string): Promise<string[]> {
        const queryString = `
            SELECT id
                FROM public."blog_entity"
                WHERE "ownerId"=$1 AND "isBanned"=false
        `

        try {
            return this.dataSource.query(queryString, [creatorId])
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async banBlog(blogId: string, banInputModel: BanBlogInputModel): Promise<boolean> {
        const queryString = `
            UPDATE public."blog_entity"
                SET "idBanned"=$2, "banDate"=now()
                WHERE id=$1
        `

        try {
            await this.dataSource.query(queryString, [blogId, banInputModel.isBanned])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async unbanBlog(blogId: string, banInputModel: BanBlogInputModel): Promise<boolean> {
        const queryString = `
            UPDATE public."blog_entity"
                SET "idBanned"=$2, "banDate"=null
                WHERE id=$1
        `

        try {
            await this.dataSource.query(queryString, [blogId, banInputModel.isBanned])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async deleteBlog(id: string): Promise<boolean> {
        const queryString = `
            DELETE FROM public."blog_entity"
                WHERE id=$1;
        `

        try {
            await this.dataSource.query(queryString, [id])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}