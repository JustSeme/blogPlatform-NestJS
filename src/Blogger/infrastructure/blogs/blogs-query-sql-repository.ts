import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"
import {
    BlogViewModel, BlogsWithQueryOutputModel
} from "../../../blogs/application/dto/BlogViewModel"
import { ReadBlogsQueryParams } from "../../../blogs/api/models/ReadBlogsQuery"
import { BlogsWithQuerySuperAdminOutputModel } from "../../../SuperAdmin/application/dto/BlogSuperAdminViewModel"
import {
    BlogDBModel, BlogSQLModel
} from "../../domain/blogs/BlogsTypes"

@Injectable()
export class BlogsQuerySQLRepository {
    constructor(private dataSource: DataSource) { }

    async findBlogs(queryParams: ReadBlogsQueryParams, creatorId?: string | undefined): Promise<BlogsWithQueryOutputModel> {
        const {
            searchNameTerm = '',
            sortDirection = 'desc',
            sortBy = 'createdAt',
            pageNumber = 1,
            pageSize = 10
        } = queryParams

        const queryCount = `
            SELECT count(*)
                FROM public."blog_entity"
                WHERE lower("name") LIKE lower($1) AND "isBanned"=false AND "ownerId" = $2
        `

        const totalCountData = await this.dataSource.query(queryCount, [`%${searchNameTerm}%`, creatorId])
        const totalCount = totalCountData[0].count
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const query = `
            SELECT *
                FROM public."blog_entity"
                WHERE lower("name") LIKE lower($1) AND "isBanned"=false AND "ownerId" = $2
                ORDER BY "${sortBy}" ${sortDirection}
                LIMIT ${pageSize} OFFSET ${skipCount};
        `

        const resultedBlogs: BlogSQLModel[] = await this.dataSource.query(query, [`%${searchNameTerm}%`, creatorId])
        const displayedBlogs = resultedBlogs.map(blog => new BlogViewModel(blog))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: displayedBlogs
        }
    }

    async findBlogsForSuperAdmin(queryParams: ReadBlogsQueryParams, creatorId?: string | undefined): Promise<BlogsWithQuerySuperAdminOutputModel> {
        const {
            searchNameTerm = '',
            sortDirection = 'desc',
            sortBy = 'createdAt',
            pageNumber = 1,
            pageSize = 10
        } = queryParams

        const queryCount = `
            SELECT count(*)
                FROM public."blog_entity"
                WHERE lower("name") LIKE lower($1) ${creatorId ? `AND "ownerId" = ${creatorId}` : ''}
        `

        const totalCountData = await this.dataSource.query(queryCount, [`%${searchNameTerm}%`])
        const totalCount = totalCountData[0].count
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const query = `
            SELECT *
                FROM public."blog_entity"
                WHERE lower("name") LIKE lower($1) ${creatorId ? `AND "ownerId" = ${creatorId}` : ''}
                ORDER BY "${sortBy}" ${sortDirection}
                LIMIT $2 OFFSET $3;
        `

        const resultedBlogs: BlogSQLModel[] = await this.dataSource.query(query, [`%${searchNameTerm}%`, pageSize, skipCount])
        const displayedBlogs = resultedBlogs.map(blog => new BlogDBModel(blog))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: displayedBlogs
        }
    }

}