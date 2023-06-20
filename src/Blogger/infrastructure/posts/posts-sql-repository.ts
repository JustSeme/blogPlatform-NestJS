import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import {
    PostDBModel,
    PostDTO
} from "../../domain/posts/PostsTypes"
import {
    ExtendedLikesInfoViewType, PostsViewModel
} from "../../../blogs/application/dto/PostViewModel"
import { PostInputModel } from "../../api/models/PostInputModel"
import { PostEntity } from "../../domain/posts/typeORM/post.entity"

@Injectable()
export class PostsSQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async unHideAllLikeEntitiesForPostsByUserId(userId: string) {
        const queryString = `
            UPDATE public.post_likes_info
                SET "isBanned"=false
                WHERE "userId" = $1
            `

        try {
            await this.dataSource.query(queryString, [userId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async hideAllLikeEntitiesForPostsByUserId(userId: string) {
        const queryString = `
            UPDATE public.post_likes_info
                SET "isBanned"=true
                WHERE "userId" = $1
            `

        try {
            await this.dataSource.query(queryString, [userId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async createPost(creatingPost: PostDTO): Promise<PostsViewModel> {
        const queryString = `
            INSERT INTO public.post_entity
                (title, "shortDescription", "content", "blogName", "ownerLogin", "blogId", "ownerId")
                VALUES($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;
        `

        try {
            const createdPost = await this.dataSource.query(queryString, [
                creatingPost.title,
                creatingPost.shortDescription,
                creatingPost.content,
                creatingPost.blogName,
                creatingPost.postOwnerInfo.userLogin,
                creatingPost.blogId,
                creatingPost.postOwnerInfo.userId,
            ])

            if (!createdPost[0]) {
                return null
            }

            return new PostsViewModel(createdPost[0])
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async getPostById(postId: string): Promise<PostDBModel> {
        const queryString = `
            SELECT *
                FROM public."post_entity"
                WHERE id = $1 AND "isBanned" = false
        `

        try {
            const postData = await this.dataSource.query(queryString, [postId])

            if (!postData[0]) {
                return null
            }

            return new PostDBModel(postData[0])
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async getPostByIdWithLikesInfo(postId: string, userId: string): Promise<PostsViewModel> {
        const queryString = `
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
                    WHERE pli."postId" = pe.id AND pli."userId" = $2 AND pli."isBanned" = false
            ) as "myStatus",
            (
                SELECT jsonb_agg(json_build_object('addedAt', agg."createdAt", 'userId', agg."userId", 'login', agg."ownerLogin" ))
                    FROM (
                        SELECT pli."createadAt" 
                            FROM public."post_likes_info" pli
                            WHERE pli."isBanned" = false AND pli."likeStatus" = 'Like' AND pli."postId" = pe.id
                            ORDER BY pli."createdAt" DESC
                            LIMIT 3
                        ) as agg ) as "newestLikes"
                FROM public."post_entity" pe
                LEFT JOIN public."user_entity" ue ON ue.id = pe."ownerId"
                WHERE pe.id = $1 AND ue."isBanned" = false
        `

        try {
            const postData: Array<PostEntity & ExtendedLikesInfoViewType> = await this.dataSource.query(queryString, [postId, userId])

            if (!postData[0]) {
                return null
            }

            return new PostsViewModel(postData[0])
        } catch (err) {
            console.error(err)
            return null
        }
    }
    async deletePost(id: string): Promise<boolean> {
        const queryString = `
            DELETE FROM public."post_entity"
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

    async hideAllPostsForCurrentUser(userId: string): Promise<boolean> {
        const queryString = `
            UPDATE public."post_entity"
                SET "isBanned"=true
                WHERE "ownerId"=$1
        `

        try {
            await this.dataSource.query(queryString, [userId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async unhideAllPostsForCurrentUser(userId: string): Promise<boolean> {
        const queryString = `
            UPDATE public."post_entity"
                SET "isBanned"=false
                WHERE "ownerId"=$1
        `

        try {
            await this.dataSource.query(queryString, [userId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async updatePost(postId: string, body: PostInputModel): Promise<boolean> {
        const queryString = `
            UPDATE public."post_entity"
                SET "title"=$2, "shortDescription"=$3, "content"=$4
                WHERE id=$1
                RETURNING *;
        `

        try {
            await this.dataSource.query(queryString, [postId, body.title, body.shortDescription, body.content])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async isPostExists(postId: string): Promise<boolean> {
        const queryString = `
            SELECT *
                FROM public."post_entity"
                WHERE id = $1;
        `

        try {
            const postData = await this.dataSource.query(queryString, [postId])

            if (!postData[0]) {
                return false
            }

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async hidePostsByBlogId(blogId: string): Promise<boolean> {
        const queryString = `
            UPDATE public."post_entity"
                SET "isBanned"=true
                WHERE "blogId"=$1
        `

        try {
            await this.dataSource.query(queryString, [blogId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async unHidePostsByBlogId(blogId: string): Promise<boolean> {
        const queryString = `
            UPDATE public."post_entity"
                SET "isBanned"=false
                WHERE "blogId"=$1
        `

        try {
            await this.dataSource.query(queryString, [blogId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async isLikeEntityExists(userId: string, postId: string) {
        const queryString = `
        SELECT id
            FROM public."post_likes_info"
            WHERE "userId" = $1 AND "postId" = $2;
        `

        try {
            const idData = await this.dataSource.query(queryString, [userId, postId])

            return idData[0] ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async updateLikeStatus(userId: string, postId: string, likeStatus: string): Promise<boolean> {
        const queryString = `
        UPDATE public.post_likes_info
            SET "likeStatus"=$3
            WHERE "userId" = $1 AND "postId" = $2;
        `

        try {
            await this.dataSource.query(queryString, [userId, postId, likeStatus])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async createLike(userId: string, postId: string, ownerLogin: string): Promise<boolean> {
        const queryString = `
        INSERT INTO public.post_likes_info
            ("userId", "likeStatus", "postId", "ownerLogin")
            VALUES($1, 'Like', $2, $3);
        `

        try {
            await this.dataSource.query(queryString, [userId, postId, ownerLogin])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async createDislike(userId: string, postId: string, ownerLogin: string): Promise<boolean> {
        const queryString = `
        INSERT INTO public.post_likes_info
            ("userId", "likeStatus", "postId", "ownerLogin")
            VALUES($1, 'Dislike', $2, $3);
        `

        try {
            await this.dataSource.query(queryString, [userId, postId, ownerLogin])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}