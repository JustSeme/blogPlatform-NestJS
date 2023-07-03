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
import {
    CommentViewModel, LikesInfoViewType
} from "../../../application/dto/CommentViewModel"

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

    async getCommentByIdWithLikesInfo(commentId: string, userId: string): Promise<CommentViewModel> {
        try {
            const commentById = await this.commentsRepository
                .createQueryBuilder('ce')
                .where('ce.id = :commentId', { commentId })
                .andWhere('ce.isBanned = false')
                .loadRelationCountAndMap('ce.likesCount', 'ce.commentLikes', 'like', (like) => like
                    .where({ 'likeStatus': 'Like' })
                    .andWhere({ 'isBanned': false })
                )
                .loadRelationCountAndMap('ce.dislikesCount', 'ce.commentLikes', 'dislike', (dislike) => dislike
                    .where({ 'likeStatus': 'Dislike' })
                    .andWhere({ 'isBanned': false })
                )
                .addSelect(
                    (qb) => qb
                        .select('cli.likeStatus')
                        .from('comment_likes_info', 'cli')
                        .where('cli.commentId = ce.id')
                        .andWhere('cli.userId = :userId', { userId })
                    , 'myStatus'
                )
                .getRawOne()


            console.log(commentById)
            //TODO Сделать маппинг, приходит чета жесткое

            /* const myStatus = await this.commentLikesInfoRepository
                .createQueryBuilder('cli')
                .select('cli.likeStatus')
                .where('cli.userId = :userId', { userId })
                .andWhere('cli.commentId = :commentId', { commentId })
                .getOne() */

            const commentWithLikesInfo = {
                ...commentById,
                //myStatus: myStatus.likeStatus
            }

            return new CommentViewModel(commentWithLikesInfo as CommentEntity & LikesInfoViewType)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    /* {
  ce_id: '6cbec36e-aff3-4e31-9e3a-e25c749eb400',
  ce_content: 'this is a content for new comment',
  ce_createdAt: 2023-07-03T12:39:24.891Z,
  ce_isBanned: false,
  ce_commentatorLogin: 'justSeme',
  ce_postTitle: 'dsfdsfdsf',
  ce_blogName: 'abc',
  ce_commentatorId: '8f49e78d-9276-4e2b-8ceb-f1a36194c5d6',
  ce_postId: '28e2c532-38e7-4d09-badc-1f9f716bb5ec',
  ce_blogId: null,
  myStatus: 'Dislike'
} */

    private commentsMapping(comments: any[]): Array<CommentViewModel> {
        return comments.map((comment) => ({
            id: String(comment.ce_id),
            content: String(comment.ce_content),
            createdAt: comment.ce_createdAt as Date,
            isBanned: Boolean(comment.ce_isBanned),
            commentatorInfo: {
                userLogin: String(comment.ce_commentatorLogin),
                userId: String(comment.ce_commentatorId),
            },
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None'
            },
            postTitle: String(comment.ce_postTitle),
            blogName: String(comment.ce_blogName),
            postId: String(comment.ce_postId),
            blogId: String(comment.ce_blogId),
            myStatus: String(comment.myStatus),
        }))
    }
}