import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { CommentDBModel } from "../../domain/comments/CommentTypes"
import { CommentViewModel } from "../../application/dto/CommentViewModel"
import { CommentEntity } from "../../domain/comments/typeORM/comment.entity"
import { LikeType } from "../../api/models/LikeInputModel"

@Injectable()
export class CommentsSQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createComment(creatingComment: CommentDBModel): Promise<CommentViewModel> {
        const createCommentQuery = `
            INSERT INTO public.comment_entity
                ("content", "commentatorId", "commentatorLogin", "postTitle", "blogName", "blogId", "postId")
                VALUES($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;
        `

        try {
            const createdCommentData: CommentEntity = await this.dataSource.query(createCommentQuery, [
                creatingComment.content,
                creatingComment.commentatorInfo.userId,
                creatingComment.commentatorInfo.userLogin,
                creatingComment.postInfo.title,
                creatingComment.postInfo.blogName,
                creatingComment.postInfo.blogId,
                creatingComment.postInfo.id
            ])

            return new CommentViewModel(createdCommentData[0])
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async deleteComment(commentId: string): Promise<boolean> {
        const deleteLikesInfoQuery = `
        DELETE FROM public.comment_likes_info
            WHERE "commentId" = $1
        `

        const deletePostInfoQuery = `
        DELETE FROM public.comment_post_info
            WHERE "commentId" = $1
        `

        const deleteCommentQuery = `
        DELETE FROM public.comment_entity
            WHERE id = $1;
        `

        const queryRunner = await this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(deleteLikesInfoQuery, [commentId])
            await queryRunner.query(deletePostInfoQuery, [commentId])
            await queryRunner.query(deleteCommentQuery, [commentId])

            await queryRunner.commitTransaction()
            return true
        } catch (err) {
            console.error(err)

            await queryRunner.rollbackTransaction()
            return false
        } finally {
            await queryRunner.release()
        }
    }

    async isCommentExists(commentId: string): Promise<boolean> {
        const queryString = `
            SELECT id
                FROM public.comment_entity
                WHERE id = $1;
        `

        try {
            const idData = await this.dataSource.query(queryString, [commentId])

            return idData[0] ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async getCommentByIdWithLikesInfo(commentId: string, userId: string): Promise<CommentViewModel> {
        const queryString = `
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
            ) as "dislikesCount"
            (
                SELECT "likeStatus"
                    FROM public."comment_likes_info" cli
                    WHERE cli."commentId" = ce.id AND cli."userId" = $2 AND cli."isBanned" = false
            )
                FROM public.comment_entity ce
                WHERE ce.id = $1 AND ce."isBanned" = false;
        `

        try {
            const commentData: Array<CommentEntity & { dislikesCount: number, likesCount: number, likeStatus: LikeType }> = await this.dataSource.query(queryString, [commentId, userId])

            if (!commentData[0]) {
                return null
            }

            return new CommentViewModel(commentData[0])
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async updateComment(commentId: string, content: string): Promise<boolean> {
        const queryString = `
        UPDATE public.comment_entity
            SET "content"=$2
            WHERE id=$1;
        `

        try {
            await this.dataSource.query(queryString, [commentId, content])

            return true
        } catch (err) {
            console.error()
            return false
        }
    }

    async isLikeEntityExists(userId: string, commentId: string): Promise<boolean> {
        const queryString = `
        SELECT id
            FROM public."comment_likes_info"
            WHERE "userId" = $1 AND "commentId" = $2;
        `

        try {
            const likeIdData = await this.dataSource.query(queryString, [userId, commentId])

            return likeIdData[0] ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async updateLikeStatus(userId: string, commentId: string, likeStatus: string): Promise<boolean> {
        const queryString = `
        UPDATE public.comment_likes_info
            SET "likeStatus"=$3
            WHERE "userId" = $1 AND "commentId" = $2;
        `

        try {
            await this.dataSource.query(queryString, [userId, commentId, likeStatus])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async createLike(userId: string, commentId: string): Promise<boolean> {
        const queryString = `
        INSERT INTO public.comment_likes_info
            ("userId", "likeStatus", "commentId")
            VALUES($1, 'Like', $2);
        `

        try {
            await this.dataSource.query(queryString, [userId, commentId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async createDislike(userId: string, commentId: string): Promise<boolean> {
        const queryString = `
        INSERT INTO public.comment_likes_info
            ("userId", "likeStatus", "commentId")
            VALUES($1, 'Dislike', $2);
        `

        try {
            await this.dataSource.query(queryString, [userId, commentId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async hideAllCommentsForCurrentUser(userId: string): Promise<boolean> {
        const queryString = `
        UPDATE public.comment_entity
            SET "isBanned"=true
            WHERE "commentatorId"=$1;
        `

        try {
            await this.dataSource.query(queryString, [userId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async unHideAllCommentsForCurrentUser(userId: string): Promise<boolean> {
        const queryString = `
        UPDATE public.comment_entity
            SET "isBanned"=false
            WHERE "commentatorId"=$1;
        `

        try {
            await this.dataSource.query(queryString, [userId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async hideAllLikeEntitiesForCommentsByUserId(userId: string): Promise<boolean> {
        const queryString = `
        UPDATE public.comment_likes_info
            SET "isBanned"=true
            WHERE "userId"=$1
        `

        try {
            await this.dataSource.query(queryString, [userId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async unHideAllLikeEntitiesForCommentsByUserId(userId: string): Promise<boolean> {
        const queryString = `
        UPDATE public.comment_likes_info
            SET "isBanned"=false
            WHERE "userId"=$1
        `

        try {
            await this.dataSource.query(queryString, [userId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}