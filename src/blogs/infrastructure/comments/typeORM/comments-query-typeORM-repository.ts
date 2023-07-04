import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { CommentEntity } from "../../../domain/comments/typeORM/comment.entity"
import { Repository } from "typeorm"
import {
    CommentViewModel, CommentsWithQueryOutputModel, LikesInfoViewType
} from "../../../application/dto/CommentViewModel"
import { CommentLikesInfo } from "../../../domain/comments/typeORM/comment-likes-info.entity"
import { ReadCommentsQueryParams } from "../../../api/models/ReadCommentsQuery"
import { writeInFile } from "../../../../general/helpers"

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
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10
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
            .select(['ce.id', 'ce.content', 'ce.createdAt', 'ce.isBanned', 'ce.commentatorLogin', 'ce.postTitle', 'ce.blogName', 'commentLikes.likeStatus'])
            .loadRelationCountAndMap('ce.likesCount', 'ce.commentLikes', 'likeEntity', (likeEntity) => likeEntity
                .where({ 'likeStatus': 'Like' })
                .andWhere({ 'isBanned': false })
            )
            .loadRelationCountAndMap('ce.dislikesCount', 'ce.commentLikes', 'likeEntity', (likeEntity) => likeEntity
                .where({ 'likeStatus': 'Dislike' })
                .andWhere({ 'isBanned': false })
            )
            .leftJoinAndSelect('ce.commentator', 'commentator')
            .leftJoin('ce.commentLikes', 'commentLikes',)

        const sql = builder.getSql()

        await writeInFile('sql.txt', sql)

        const resultedComments = await builder
            .getMany()

        console.log(resultedComments)

        return null
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

}