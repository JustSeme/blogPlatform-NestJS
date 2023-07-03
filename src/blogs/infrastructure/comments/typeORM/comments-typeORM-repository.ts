import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import { CommentEntity } from "../../../domain/comments/typeORM/comment.entity"
import {
    DataSource, EntityManager, Repository
} from "typeorm"
import { CommentEntitiesType } from "../CommentsTypes"
import { CommentLikesInfo } from "../../../domain/comments/typeORM/comment-likes-info.entity"

@Injectable()
export class CommentsTypeORMRepository {
    constructor(
        @InjectRepository(CommentEntity)
        private commentsRepository: Repository<CommentEntity>,
        @InjectRepository(CommentLikesInfo)
        private commentLikesInfoRepository: Repository<CommentLikesInfo>,
        @InjectDataSource() private dataSource: DataSource
    ) { }

    async queryRunnerSave(
        entity: CommentEntitiesType,
        queryRunnerManager: EntityManager
    ): Promise<CommentEntitiesType> {
        return queryRunnerManager.save(entity)
    }

    async dataSourceSave(
        entity: CommentEntitiesType
    ): Promise<CommentEntitiesType> {
        return this.dataSource.manager.save(entity)
    }

    async deleteCommentLikesInfo(commentId: string): Promise<boolean> {
        try {
            await this.commentLikesInfoRepository.delete({ comment: { id: commentId } })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async deleteComment(commentId: string): Promise<boolean> {
        try {
            await this.commentsRepository.delete({ id: commentId })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async getCommentById(commentId: string): Promise<CommentEntity> {
        try {
            return this.commentsRepository.findOne({
                where: { id: commentId },
                relations: ['commentator']
            })
        } catch (err) {
            console.error(err)
            return null
        }
    }

    /* async getCommentByIdWithLikesInfo(commentId: string, userId: string): Promise<CommentViewModel> {
        try {
            return this.commentsRepository
                .createQueryBuilder('ce')
                .where('ce.id = :commentId', { commentId })

        } catch (err) {
            console.error(err)
            return null
        }
    } */
}