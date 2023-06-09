import { Injectable } from "@nestjs/common"
import { ReadPostsQueryParams } from "../../../blogs/api/models/ReadPostsQuery"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { PostEntity } from "../../domain/posts/post.entity"
import { PostsViewModel } from "../../../blogs/application/dto/PostViewModel"


@Injectable()
export class PostsQuerySQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async findPosts(queryParams: ReadPostsQueryParams, blogId: string | null) {
        const {
            sortDirection = 'desc',
            sortBy = 'createdAt',
            pageNumber = 1,
            pageSize = 10
        } = queryParams

        const queryCount = `
            SELECT count(*)
                FROM public."post_entity"
                WHERE "isBanned"=false ${blogId ? `AND "blogId" = $1` : ''}
        `

        const totalCountData = await this.dataSource.query(queryCount, [blogId])
        const totalCount = totalCountData[0].count
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const query = `
            SELECT *
                FROM public."post_entity"
                WHERE "isBanned"=false ${blogId ? `AND "blogId" = $1` : ''}
                ORDER BY "${sortBy}" ${sortDirection}
                LIMIT ${pageSize} OFFSET ${skipCount};
        `

        const resultedPosts: PostEntity[] = await this.dataSource.query(query, [blogId])
        const displayedPosts = resultedPosts.map(post => new PostsViewModel(post))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: displayedPosts
        }
    }

}