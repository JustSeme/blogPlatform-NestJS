import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { ReadCommentsQueryParams } from "../../api/models/ReadCommentsQuery"
import { CommentEntity } from "../../domain/typeORM/comment.entity"
import {
    CommentViewModel, CommentsWithQueryOutputModel, LikesInfoViewType
} from "../../application/dto/CommentViewModel"
import { LikeType } from "../../api/models/LikeInputModel"
import {
    CommentViewModelForBlogger, CommentsForBloggerWithQueryOutputModel
} from "../../application/dto/CommentViewModelForBlogger"

@Injectable()
export class CommentsQuerySQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async getCommentsForPost(queryParams: ReadCommentsQueryParams, postId: string, userId: string): Promise<CommentsWithQueryOutputModel> {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10
        } = queryParams

        const queryCount = `
            SELECT count(*)
                FROM public."comment_entity" ce
                WHERE ce."isBanned"=false AND ce."postId" = $1
        `

        const totalCountData = await this.dataSource.query(queryCount, [postId])
        const totalCount = totalCountData[0].count
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const query = `
            SELECT *,
            (
                SELECT count(*)
                    FROM public."comment_likes_info" cli
                    WHERE cli."commentId" = ce.id AND cli."likeStatus" = 'Like' AND cli."isBanned" = false
            ) as "likesCount",
            (
                SELECT count(*)
                    FROM public."comment_likes_info" cli
                    WHERE cli."commentId" = ce.id AND cli."likeStatus" = 'Dislike' AND cli."isBanned" = false
            ) as "dislikesCount",
            (
                SELECT "likeStatus"
                    FROM public."comment_likes_info" cli
                    WHERE cli."commentId" = ce.id AND cli."userId" = $2 AND cli."isBanned" = false
            ) as "myStatus"
                FROM public."comment_entity" ce
                WHERE ce."isBanned"=false AND ce."postId" = $1
                ORDER BY ce."${sortBy}" ${sortDirection}
                LIMIT ${pageSize} OFFSET ${skipCount};
        `

        const resultedComments: Array<CommentEntity & LikesInfoViewType> = await this.dataSource.query(query, [postId, userId])
        const displayedComments = resultedComments.map(comment => new CommentViewModel(comment))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: displayedComments
        }
    }

    async getComments(queryParams: ReadCommentsQueryParams): Promise<CommentsWithQueryOutputModel> {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10
        } = queryParams

        const queryCount = `
            SELECT count(*)
                FROM public."comment_entity" ce
                WHERE ce."isBanned"=false
        `

        const totalCountData = await this.dataSource.query(queryCount)
        const totalCount = totalCountData[0].count
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const query = `
            SELECT *,
            (
                SELECT count(*)
                    FROM public."comment_likes_info" cli
                    WHERE cli."commentId" = ce.id AND cli."likeStatus" = 'Like' AND cli."isBanned" = false
            ) as "likesCount",
            (
                SELECT count(*)
                    FROM public."comment_likes_info" cli
                    WHERE cli."commentId" = ce.id AND cli."likeStatus" = 'Dislike' AND cli."isBanned" = false
            ) as "dislikesCount",
            (
                SELECT "likeStatus"
                    FROM public."comment_likes_info" cli
                    WHERE cli."commentId" = ce.id AND cli."userId" = $2 AND cli."isBanned" = false
            ) as "myStatus"
                FROM public."comment_entity" ce
                WHERE ce."isBanned"=false
                ORDER BY "${sortBy}" ${sortDirection}
                LIMIT ${pageSize} OFFSET ${skipCount};
        `

        const resultedComments: Array<CommentEntity & LikesInfoViewType> = await this.dataSource.query(query)
        const displayedComments = resultedComments.map(comment => new CommentViewModel(comment))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: displayedComments
        }
    }

    async getAllCommentsForBlogger(readCommentsQuery: ReadCommentsQueryParams, bloggerId: string): Promise<CommentsForBloggerWithQueryOutputModel> {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10
        } = readCommentsQuery

        const queryCount = `
            SELECT count(*)
                FROM public."comment_entity" ce
                LEFT JOIN public."blog_entity" be ON be.id = ce."blogId"
                WHERE ce."isBanned"=false AND be."ownerId" = $1
        `

        const totalCountData = await this.dataSource.query(queryCount, [bloggerId])
        const totalCount = totalCountData[0].count
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const query = `
            SELECT *,
                ce.id, ce."createdAt", ce."isBanned",
            (
                SELECT count(*)
                    FROM public."comment_likes_info" cli
                    WHERE cli."commentId" = ce.id AND cli."likeStatus" = 'Like' AND cli."isBanned" = false
            ) as "likesCount",
            (
                SELECT count(*)
                    FROM public."comment_likes_info" cli
                    WHERE cli."commentId" = ce.id AND cli."likeStatus" = 'Dislike' AND cli."isBanned" = false
            ) as "dislikesCount",
            (
                SELECT "likeStatus"
                    FROM public."comment_likes_info" cli
                    WHERE cli."commentId" = ce.id AND cli."userId" = $1 AND cli."isBanned" = false
            )
                FROM public."comment_entity" ce
                LEFT JOIN public."blog_entity" be ON be.id = ce."blogId"
                WHERE ce."isBanned"=false AND be."ownerId" = $1
                ORDER BY ce."${sortBy}" ${sortDirection}
                LIMIT ${pageSize} OFFSET ${skipCount};
        `

        const resultedComments: Array<CommentEntity & { dislikesCount: number, likesCount: number, likeStatus: LikeType }> = await this.dataSource.query(query, [bloggerId])
        const displayedComments = resultedComments.map(comment => new CommentViewModelForBlogger(comment))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: displayedComments
        }
    }
}