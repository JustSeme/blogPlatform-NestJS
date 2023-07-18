import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import {
    DataSource, EntityManager, Repository
} from "typeorm"
import { CommentEntity } from "../../domain/typeORM/comment.entity"
import { CommentLikesInfo } from "../../domain/typeORM/comment-likes-info.entity"
import { CommentEntitiesType } from "../CommentTypes"

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
        try {
            return queryRunnerManager.save(entity)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async dataSourceSave(
        entity: CommentEntitiesType
    ): Promise<CommentEntitiesType> {
        try {
            return this.dataSource.manager.save(entity)
        } catch (err) {
            console.error(err)
            return null
        }
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

    async isCommentExists(commentId: string): Promise<boolean> {
        try {
            const commentById = await this.getCommentById(commentId)
            return commentById ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async getLikeEntity(userId: string, commentId: string): Promise<CommentLikesInfo> {
        try {
            const likeEntity = await this.commentLikesInfoRepository.findOne({
                where: {
                    user: { id: userId },
                    comment: { id: commentId }
                }
            })
            return likeEntity
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async updateIsBannedCommentsByUserId(userId: string, isBanned: boolean): Promise<boolean> {
        try {
            const updateResult = await this.commentsRepository.update({ commentator: { id: userId } }, { isBanned: isBanned })

            return updateResult ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async updateIsBannedLikeEntitiesForCommentsByUserId(userId: string, isBanned: boolean): Promise<boolean> {
        try {
            await this.commentLikesInfoRepository.update({ user: { id: userId } }, { isBanned: isBanned })
            return true
        } catch (err) {
            return false
        }
    }
}