import {
    CommentsWithQueryOutputModel, CommentViewModel
} from "./dto/CommentViewModel"
import { LikeType } from "../api/models/LikeInputModel"
import { ReadCommentsQueryParams } from "../api/models/ReadCommentsQuery"
import { CommentsRepository } from "../infrastructure/comments/comments-db-repository"
import { UserDTO } from "../../auth/domain/UsersTypes"
import { Injectable } from "@nestjs/common"
import {
    CommentDBModel, LikeObjectType
} from "../domain/comments/CommentTypes"
import { JwtService } from "../../general/adapters/jwt.adapter"

@Injectable()
export class CommentsService {
    constructor(protected jwtService: JwtService, protected commentsRepository: CommentsRepository) { }

    async createComment(content: string, commentator: UserDTO | null, postId: string) {
        if (!commentator) {
            return null
        }

        const createdComment = new CommentDBModel(content, postId, commentator.id, commentator.login)

        await this.commentsRepository.createComment(createdComment)

        return {
            id: createdComment.id,
            content: createdComment.content,
            commentatorInfo: { ...createdComment.commentatorInfo },
            createdAt: createdComment.createdAt,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None' as LikeType
            }
        }
    }

    async deleteComment(commentId: string) {
        return await this.commentsRepository.deleteComment(commentId)
    }

    async updateComment(commentId: string, content: string) {
        return this.commentsRepository.updateComment(commentId, content)
    }

    async updateLike(userId: string, commentId: string, status: LikeType) {
        const updatingComment = await this.commentsRepository.getCommentById(commentId)
        if (!updatingComment) {
            return false
        }

        const likeData: LikeObjectType = {
            userId,
            createdAt: new Date().toISOString()
        }

        const isNoneSetted = await this.commentsRepository.setNoneLike(userId, commentId)

        if (status === 'Like') {
            return this.commentsRepository.setLike(likeData, commentId)
        }

        if (status === 'Dislike') {
            return this.commentsRepository.setDislike(likeData, commentId)
        }
        return isNoneSetted
    }

    async getComments(queryParams: ReadCommentsQueryParams, postId: string, accessToken: string | null): Promise<CommentsWithQueryOutputModel> {
        const commentsDBQueryData = await this.commentsRepository.getComments(queryParams, postId)
        const commentsViewQueryData: CommentsWithQueryOutputModel = {
            ...commentsDBQueryData, items: []
        }

        const displayedComments = await this.transformLikeInfo(commentsDBQueryData.items, accessToken)

        commentsViewQueryData.items = displayedComments
        return commentsViewQueryData
    }

    async getCommentById(commentId: string, accessToken: string | null): Promise<CommentViewModel | null> {
        const recivedComment = await this.commentsRepository.getCommentById(commentId)
        if (!recivedComment) {
            return null
        }

        const displayedComment: CommentViewModel[] = await this.transformLikeInfo([recivedComment], accessToken)
        return displayedComment[0]
    }

    async transformLikeInfo(commentsArray: CommentDBModel[], accessToken: string | null): Promise<CommentViewModel[]> {
        let userId: string | null = null
        if (accessToken) {
            const jwtResult = await this.jwtService.verifyAccessToken(accessToken)
            userId = jwtResult ? jwtResult.userId : null
        }

        const convertedComments = commentsArray.map((comment: CommentDBModel) => {
            const likesInfoData = comment.likesInfo

            let myStatus: LikeType = 'None'

            // check that comment was liked current user
            if (likesInfoData.likes.some((el: LikeObjectType) => el.userId === userId)) {
                myStatus = 'Like'
            }

            //check that comment was disliked current user
            if (likesInfoData.dislikes.some((el: LikeObjectType) => el.userId === userId)) {
                myStatus = 'Dislike'
            }

            const convertedComment: CommentViewModel = {
                id: comment.id,
                content: comment.content,
                commentatorInfo: {
                    userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin
                },
                createdAt: comment.createdAt,
                likesInfo: {
                    likesCount: likesInfoData.likes.length,
                    dislikesCount: likesInfoData.dislikes.length,
                    myStatus: myStatus
                }
            }

            return convertedComment
        })

        return convertedComments
    }
}