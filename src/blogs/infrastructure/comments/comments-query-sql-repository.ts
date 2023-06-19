import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { ReadCommentsQueryParams } from "../../api/models/ReadCommentsQuery"
import { PostsViewModel } from "../../application/dto/PostViewModel"
import { CommentEntity } from "../../domain/comments/typeORM/comment.entity"
import { CommentViewModel } from "../../application/dto/CommentViewModel"

@Injectable()
export class CommentsQuerySQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async getCommentsForPost(queryParams: ReadCommentsQueryParams, postId: string): Promise<any> {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10
        } = queryParams

        const queryCount = `
            SELECT count(*)
                FROM public."comment_entity" ce
                WHERE ce."isBanned"=false AND ce.postId = $1
        `

        const totalCountData = await this.dataSource.query(queryCount, [postId])
        const totalCount = totalCountData[0].count
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const query = `
            SELECT *
                FROM public."comment_entity" ce
                WHERE ce."isBanned"=false AND ce.postId = $1
                ORDER BY "${sortBy}" ${sortDirection}
                LIMIT ${pageSize} OFFSET ${skipCount};
        `

        const resultedComments: Array<CommentEntity> = await this.dataSource.query(query, [postId])
        const displayedComments = resultedComments.map(comment => new CommentViewModel(comment))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: displayedComments
        }
    }

    async getComments(queryParams: ReadCommentsQueryParams): Promise<any> {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10
        } = queryParams

        const queryCount = `
            SELECT count(*)
                FROM public."comment_post_info" cpi
                LEFT JOIN public."comment_entity" ce ON ce.id = cpi."commentId"
                WHERE ce."isBanned"=false AND cpi.id = $1
        `

        const totalCountData = await this.dataSource.query(queryCount)
        const totalCount = totalCountData[0].count
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const query = `
            SELECT *
                FROM public."comment_post_info" cpi
                LEFT JOIN public."comment_entity" ce ON ce.id = cpi."commentId"
                WHERE ce."isBanned"=false AND cpi.id = $1
                ORDER BY "${sortBy}" ${sortDirection}
                LIMIT ${pageSize} OFFSET ${skipCount};
        `

        const resultedComments = await this.dataSource.query(query)
        const displayedComments = resultedComments.map(comment => new PostsViewModel(comment))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: displayedComments
        }
    }
}