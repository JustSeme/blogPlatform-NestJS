import { Injectable } from "@nestjs/common"
import { ReadPostsQueryParams } from "../../../../blogs/api/models/ReadPostsQuery"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { PostEntity } from "../../../domain/posts/typeORM/post.entity"
import {
    ExtendedLikesInfoViewType, PostsViewModel
} from "../../../../blogs/application/dto/PostViewModel"


@Injectable()
export class PostsQuerySQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async findPosts(queryParams: ReadPostsQueryParams, userId: string) {
        const {
            sortDirection = 'desc',
            sortBy = 'createdAt',
            pageNumber = 1,
            pageSize = 10
        } = queryParams

        const queryCount = `
            SELECT count(*)
                FROM public."post_entity"
                WHERE "isBanned"=false
        `

        const totalCountData = await this.dataSource.query(queryCount)
        const totalCount = totalCountData[0].count
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const query = `
            SELECT *,
                pe."createdAt" as "createdAt",
                pe.id as "id",
            (
                SELECT count(*)
                    FROM public."post_likes_info" pli
                    WHERE pli."postId" = pe.id AND pli."likeStatus" = 'Like' AND pli."isBanned" = false
            ) as "likesCount",
            (
                SELECT count(*)
                    FROM public."post_likes_info" pli
                    WHERE pli."postId" = pe.id AND pli."likeStatus" = 'Dislike' AND pli."isBanned" = false
            ) as "dislikesCount",
            (
                SELECT "likeStatus"
                    FROM public."post_likes_info" pli
                    WHERE pli."postId" = pe.id AND pli."userId" = $1 AND pli."isBanned" = false
            ) as "myStatus",
            (
                SELECT jsonb_agg(json_build_object('addedAt', agg."createdAt", 'userId', agg."userId", 'login', agg."ownerLogin" ))
                    FROM (
                        SELECT pli."createdAt", pli."userId", pli."ownerLogin"
                            FROM public."post_likes_info" pli
                            WHERE pli."isBanned" = false AND pli."likeStatus" = 'Like' AND pli."postId" = pe.id
                            ORDER BY pli."createdAt" DESC
                            LIMIT 3
                        ) as agg 
            ) as "newestLikes"
                FROM public."post_entity" pe
                WHERE pe."isBanned"=false
                ORDER BY "${sortBy}" ${sortDirection}
                LIMIT ${pageSize} OFFSET ${skipCount};
        `

        const resultedPosts: Array<PostEntity & ExtendedLikesInfoViewType> = await this.dataSource.query(query, [userId])
        const displayedPosts = resultedPosts.map(post => new PostsViewModel(post))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: displayedPosts
        }
    }

    async findPostsForBlog(queryParams: ReadPostsQueryParams, blogId: string, userId: string) {
        const {
            sortDirection = 'desc',
            sortBy = 'createdAt',
            pageNumber = 1,
            pageSize = 10
        } = queryParams

        const queryCount = `
            SELECT count(*)
                FROM public."post_entity"
                WHERE "isBanned"=false AND "blogId" = $1
        `

        const totalCountData = await this.dataSource.query(queryCount, [blogId])
        const totalCount = totalCountData[0].count
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const query = `
            SELECT *,
                pe."createdAt" as "createdAt",
                pe.id as "id",
            (
                SELECT count(*)
                    FROM public."post_likes_info" pli
                    WHERE pli."postId" = pe.id AND pli."likeStatus" = 'Like' AND pli."isBanned" = false
            ) as "likesCount",
            (
                SELECT count(*)
                    FROM public."post_likes_info" pli
                    WHERE pli."postId" = pe.id AND pli."likeStatus" = 'Dislike' AND pli."isBanned" = false
            ) as "dislikesCount",
            (
                SELECT "likeStatus"
                    FROM public."post_likes_info" pli
                    WHERE pli."postId" = pe.id AND pli."userId" = $1 AND pli."isBanned" = false
            ) as "myStatus",
            (
                SELECT jsonb_agg(json_build_object('addedAt', agg."createdAt", 'userId', agg."userId", 'login', agg."ownerLogin" ))
                    FROM (
                        SELECT pli."createdAt", pli."userId", pli."ownerLogin"
                            FROM public."post_likes_info" pli
                            WHERE pli."isBanned" = false AND pli."likeStatus" = 'Like' AND pli."postId" = pe.id
                            ORDER BY pli."createdAt" DESC
                            LIMIT 3
                        ) as agg ) as "newestLikes"
                FROM public."post_entity" pe
                WHERE pe."isBanned"=false AND pe."blogId" = $2
                ORDER BY "${sortBy}" ${sortDirection}
                LIMIT ${pageSize} OFFSET ${skipCount};
        `

        const resultedPosts: Array<PostEntity & ExtendedLikesInfoViewType> = await this.dataSource.query(query, [userId, blogId])
        const displayedPosts = resultedPosts.map(post => new PostsViewModel(post))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: displayedPosts
        }
    }
}