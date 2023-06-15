import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { CommentDBModel } from "../../domain/comments/CommentTypes"
import { CommentViewModel } from "../../application/dto/CommentViewModel"
import { CommentEntity } from "../../domain/comments/typeORM/comment.entity"

@Injectable()
export class CommentSQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createComment(creatingComment: CommentDBModel): Promise<CommentViewModel> {
        const createCommentQuery = `
            INSERT INTO public.comment_entity
                ("content", "commentatorId", "commentatorLogin")
                VALUES($1, $2, $3)
                RETURNING *;
        `

        const createPostInfoQuery = `
            INSERT INTO public.comment_post_info_entity
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

    async
}