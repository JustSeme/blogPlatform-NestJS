import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { CommentEntity } from "../../../domain/comments/typeORM/comment.entity"
import { Repository } from "typeorm"
import {
    CommentViewModel, CommentsWithQueryOutputModel, LikesInfoViewType
} from "../../../application/dto/CommentViewModel"
import { CommentLikesInfo } from "../../../domain/comments/typeORM/comment-likes-info.entity"
import { ReadCommentsQueryParams } from "../../../api/models/ReadCommentsQuery"

@Injectable()
export class CommentsQueryTypeORMRepository {
    constructor(
        @InjectRepository(CommentEntity)
        private commentsRepository: Repository<CommentEntity>,
        @InjectRepository(CommentLikesInfo)
        private commentLikesInfoRepository: Repository<CommentLikesInfo>,
    ) { }

    async getCommentsForPost(queryParams: ReadCommentsQueryParams, postId: string, userId: string): Promise<CommentsWithQueryOutputModel> {
        const {
            sortDirection = 'DESC', sortBy = 'createdAt', pageNumber = 1, pageSize = 10
        } = queryParams

        const totalCount = await this.commentsRepository.countBy({
            isBanned: false,
            post: { id: postId }
        })
        const pagesCount = Math.ceil(totalCount / +pageSize)
        const skipCount = (+pageNumber - 1) * +pageSize

        const builder = await this.commentsRepository.
            createQueryBuilder('ce')
            .where('ce.isBanned = false')
            .addSelect(
                (qb) => qb
                    .select('count(*)')
                    .from(CommentLikesInfo, 'cli')
                    .where('cli.commentId = ce.id')
                    .andWhere('cli.isBanned = false')
                    .andWhere(`cli.likeStatus = 'Dislike'`), 'dislikesCount'
            )
            .addSelect(
                (qb) => qb
                    .select('count(*)')
                    .from(CommentLikesInfo, 'cli')
                    .where('cli.commentId = ce.id')
                    .andWhere('cli.isBanned = false')
                    .andWhere(`cli.likeStatus = 'Like'`), 'likesCount'
            )
            .leftJoinAndSelect('ce.commentator', 'commentator')
            .addSelect(
                (qb) => qb
                    .select('cli.likeStatus as "myStatus"')
                    .from(CommentLikesInfo, 'cli')
                    .where('cli.userId = :userId', { userId })
                    .andWhere('cli.commentId = ce.id', { userId })
            )
            .leftJoin('ce.post', 'p')
            .where('p.id = :postId', { postId })
            .orderBy(`ce.${sortBy}`, sortDirection)
            .limit(pageSize)
            .offset(skipCount)

        const resultedComments = await builder
            .getRawMany()

        const displayedComments = this.mapCommentsForDisplay(resultedComments)

        return {
            pagesCount: pagesCount,
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: displayedComments
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

    private mapCommentsForDisplay(comments: any[]): Array<CommentViewModel> {
        return comments.map((comment) => ({
            id: comment.ce_ie,
            content: comment.ce_content,
            createdAt: comment.ce_createdAt,
            commentatorInfo: {
                userId: comment.commentator_id,
                userLogin: comment.commentator_login
            },
            likesInfo: {
                likesCount: +comment.likesCount,
                dislikesCount: +comment.dislikesCount,
                myStatus: comment.myStatus || 'None'
            }
        }))
    }
}