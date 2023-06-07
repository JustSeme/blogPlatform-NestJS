import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BlogDTO } from '../../domain/blogs/BlogsTypes'

@Injectable()
export class BlogsSQLModel {
    constructor(private dataSource: DataSource) { }

    async createBlog(newBlog: BlogDTO) {
        const queryString = `
            INSERT INTO public.blog_entity
                ("name", description, "websiteUrl", "isMembership", "ownerId", "ownerLogin", "isBanned", "banDate")
                VALUES($1, $2, $3, $4, $5, $6, $7, $8);
        `

        try {
            await this.dataSource.query(queryString, [
                newBlog.name,
                newBlog.description,
                newBlog.websiteUrl,
                newBlog.isMembership,
                newBlog.blogOwnerInfo.userId,
                newBlog.blogOwnerInfo.userLogin,
                newBlog.banInfo.isBanned,
                newBlog.banInfo.banDate
            ])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}