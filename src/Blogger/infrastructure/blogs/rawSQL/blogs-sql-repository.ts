import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import {
    BlogDTO, BlogSQLModel
} from '../../../domain/blogs/BlogsTypes'
import { BlogInputModel } from '../../../api/models/BlogInputModel'
import { BlogViewModel } from '../../../../blogs/application/dto/BlogViewModel'
import { BlogEntity } from '../../../domain/blogs/typeORM/blog.entity'

@Injectable()
export class BlogsSQLRepository {
    constructor(private dataSource: DataSource) { }

    async createBlog(newBlog: BlogDTO): Promise<BlogViewModel> {
        const queryString = `
            INSERT INTO public.blog_entity
                ("name", description, "websiteUrl", "isMembership", "userId", "ownerLogin", "isBanned", "banDate")
                VALUES($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *;
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

            return new BlogViewModel(createdBlog[0])
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

    async findBlogById(blogId: string): Promise<BlogEntity> {
        const queryString = `
            SELECT *
                FROM public."blog_entity"
                WHERE id=$1
        `

        try {
            const findedBlogData: BlogEntity = await this.dataSource.query(queryString, [blogId])

            if (!findedBlogData[0]) {
                return null
            }

            return findedBlogData[0]
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async isBlogExists(blogId: string): Promise<boolean> {
        const queryString = `
            SELECT *
                FROM public."blog_entity"
                WHERE id=$1
        `

        try {
            const findedBlogData = await this.dataSource.query(queryString, [blogId])

            return findedBlogData[0] ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
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

    async banBlog(blogId: string): Promise<boolean> {
        const queryString = `
            UPDATE public."blog_entity"
                SET "isBanned"=true, "banDate"=now()
                WHERE id=$1
        `

        try {
            await this.dataSource.query(queryString, [blogId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async unbanBlog(blogId: string): Promise<boolean> {
        const queryString = `
            UPDATE public."blog_entity"
                SET "isBanned"=false, "banDate"=null
                WHERE id=$1
        `

        try {
            await this.dataSource.query(queryString, [blogId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    /* async deleteBlog(id: string): Promise<boolean> {
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
    } */
}