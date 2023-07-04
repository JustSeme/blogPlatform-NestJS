import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { CommentEntity } from "../../../domain/comments/typeORM/comment.entity"
import { Repository } from "typeorm"
import {
    CommentViewModel, LikesInfoViewType
} from "../../../application/dto/CommentViewModel"
import { CommentLikesInfo } from "../../../domain/comments/typeORM/comment-likes-info.entity"

@Injectable()
export class CommentsQueryTypeORMRepository {
    constructor(
        @InjectRepository(CommentEntity)
        private commentsRepository: Repository<CommentEntity>,
        @InjectRepository(CommentLikesInfo)
        private commentLikesInfoRepository: Repository<CommentLikesInfo>,
    ) { }

    async getCommentByIdWithLikesInfo(commentId: string, userId: string): Promise<CommentViewModel> {
        try {
            const commentById = await this.commentsRepository
                .createQueryBuilder('ce')
                .where('ce.id = :commentId', { commentId })
                .andWhere('ce.isBanned = false')
                .loadRelationCountAndMap('ce.likesCount', 'ce.commentLikes', 'like', (like) => like.where({ 'likeStatus': 'Like' }))
                .loadRelationCountAndMap('ce.dislikesCount', 'ce.commentLikes', 'dislike', (dislike) => dislike.where({ 'likeStatus': 'Dislike' }))
                .leftJoinAndSelect('ce.commentator', 'commentator')
                .getOne()

            const myStatus = await this.commentLikesInfoRepository
                .createQueryBuilder('cli')
                .select('cli.likeStatus')
                .where('cli.userId = :userId', { userId })
                .andWhere('cli.commentId = :commentId', { commentId })
                .getOne()

            const commentWithLikesInfo = {
                ...commentById,
                myStatus: myStatus ? myStatus.likeStatus : 'None'
            }

            return new CommentViewModel(commentWithLikesInfo as CommentEntity & LikesInfoViewType)
        } catch (err) {
            console.error(err)
            return null
        }
    }

}