import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import {
    CommentDBModel, LikeObjectType
} from "../../domain/comments/CommentTypes"
import { CommentViewModel } from "../../application/dto/CommentViewModel"
import { CommentEntity } from "../../domain/comments/typeORM/comment.entity"

@Injectable()
export class CommentsSQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createComment(creatingComment: CommentDBModel): Promise<CommentViewModel> {
        const createCommentQuery = `
            INSERT INTO public.comment_entity
                ("content", "commentatorId", "commentatorLogin")
                VALUES($1, $2, $3)
                RETURNING *;
        `

        const createPostInfoQuery = `
            INSERT INTO public.comment_post_info
                (title, "blogName", "blogId", "commentId")
                VALUES($1, $2, $3, $4);
        `

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            const createdCommentData: CommentEntity = await queryRunner.query(createCommentQuery, [
                creatingComment.content,
                creatingComment.commentatorInfo.userId,
                creatingComment.commentatorInfo.userLogin,
            ])

            await queryRunner.query(createPostInfoQuery, [
                creatingComment.postInfo.title,
                creatingComment.postInfo.blogName,
                creatingComment.postInfo.blogId,
                createdCommentData[0].id
            ])

            await queryRunner.commitTransaction()
            return new CommentViewModel(createdCommentData[0])
        } catch (err) {

            await queryRunner.rollbackTransaction()
            return null
        } finally {
            await queryRunner.release()
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

    async getCommentById(commentId: string): Promise<CommentViewModel> {
        const queryString = `
            SELECT *
                FROM public.comment_entity
                WHERE id = $1 AND "isBanned" = false;
        `

        try {
            const commentData: CommentEntity[] = await this.dataSource.query(queryString, [commentId])

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

    async setLike(likeData: LikeObjectType, commentId: string): Promise<boolean> {
        const queryString = `
        INSERT INTO public.comment_likes_info
            ("userId", "likeStatus", "commentId")
            VALUES($1, 'Like', $2);
        `

        try {
            await this.dataSource.query(queryString, [likeData.userId, commentId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async setDislike(likeData: LikeObjectType, commentId: string): Promise<boolean> {
        const queryString = `
        INSERT INTO public.comment_likes_info
            ("userId", "likeStatus", "commentId")
            VALUES($1, 'Dislike', $2);
        `

        try {
            await this.dataSource.query(queryString, [likeData.userId, commentId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async setNoneLike(userId: string, commentId: string) {
        const queryString = `
        UPDATE public.comment_likes_info
            SET "likeStatus"='None'
            WHERE "userId" = $1 AND "commentId" = $2
        `

        try {
            await this.dataSource.query(queryString, [userId, commentId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}