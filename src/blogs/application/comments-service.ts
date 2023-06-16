import { CommentViewModel } from "./dto/CommentViewModel"
import { LikeType } from "../api/models/LikeInputModel"
import { Injectable } from "@nestjs/common"
import {
    CommentDBModel, LikeObjectType
} from "../domain/comments/CommentTypes"
import { JwtService } from "../../general/adapters/jwt.adapter"
import { CommentViewModelForBlogger } from './dto/CommentViewModelForBlogger'
import { CommentEntity } from "../domain/comments/typeORM/comment.entity"
import { CommentLikesInfo } from "../domain/comments/typeORM/comment-likes-info.entity"

@Injectable()
export class CommentsService {
    constructor(
        protected jwtService: JwtService,
    ) { }

    transformCommentForBloggerDisplayWithDefaultLikeInfo(rawComment: CommentDBModel | CommentViewModelForBlogger): CommentViewModelForBlogger {
        return {
            id: rawComment.id,
            content: rawComment.content,
            commentatorInfo: { ...rawComment.commentatorInfo },
            createdAt: rawComment.createdAt,
            postInfo: { ...rawComment.postInfo },
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None'
            }
        }
    }

    async transformCommentsForBloggerDisplay(commentsArray: Array<CommentDBModel | CommentViewModelForBlogger>, userId: string | null) {
        const convertedComments = commentsArray.map((comment: CommentDBModel) => {
            const likesInfoData = comment.likesInfo

            likesInfoData.likes = likesInfoData.likes.filter((like) => !like.isBanned)
            likesInfoData.dislikes = likesInfoData.dislikes.filter((dislike) => !dislike.isBanned)

            let myStatus: LikeType = 'None'

            // check that comment was liked current user
            if (likesInfoData.likes.some((el: LikeObjectType) => el.userId === userId)) {
                myStatus = 'Like'
            }

            //check that comment was disliked current user
            if (likesInfoData.dislikes.some((el: LikeObjectType) => el.userId === userId)) {
                myStatus = 'Dislike'
            }

            // return a comment with defualt likesInfo
            const convertedComment = this.transformCommentForBloggerDisplayWithDefaultLikeInfo(comment)

            // modify likes info
            convertedComment.likesInfo = {
                likesCount: likesInfoData.likes.length,
                dislikesCount: likesInfoData.dislikes.length,
                myStatus: myStatus
            }

            return convertedComment
        })

        return convertedComments
    }

    transformCommentWithDefaultLikeInfo(rawComment: CommentDBModel | CommentViewModel): CommentViewModel {
        return {
            id: rawComment.id,
            content: rawComment.content,
            commentatorInfo: { ...rawComment.commentatorInfo },
            createdAt: rawComment.createdAt,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None' as LikeType,
            },
        }
    }

    async transformCommentsForDisplay(commentsArray: Array<CommentDBModel>, accessToken: string | null): Promise<CommentViewModel[]> {
        const userId = await this.getCorrectUserIdByAccessToken(accessToken)

        const convertedComments = commentsArray.map((comment: CommentDBModel) => {
            const likesInfoData = comment.likesInfo

            likesInfoData.likes = likesInfoData.likes.filter((like) => !like.isBanned)
            likesInfoData.dislikes = likesInfoData.dislikes.filter((dislike) => !dislike.isBanned)

            let myStatus: LikeType = 'None'

            // check that comment was liked current user
            if (likesInfoData.likes.some((el: LikeObjectType) => el.userId === userId)) {
                myStatus = 'Like'
            }

            //check that comment was disliked current user
            if (likesInfoData.dislikes.some((el: LikeObjectType) => el.userId === userId)) {
                myStatus = 'Dislike'
            }

            // return a comment with defualt likesInfo
            const convertedComment = this.transformCommentWithDefaultLikeInfo(comment)

            // modify likes info
            convertedComment.likesInfo = {
                likesCount: likesInfoData.likes.length,
                dislikesCount: likesInfoData.dislikes.length,
                myStatus: myStatus
            }

            return convertedComment
        })

        return convertedComments
    }

    /* async transformCommentsForDisplayOnSQL(commentsArray: Array<CommentEntity & CommentLikesInfo>, accessToken: string | null) {
        const userId = await this.getCorrectUserIdByAccessToken(accessToken)

        const convertedComments = commentsArray.map((comment: CommentEntity & CommentLikesInfo) => {
            const likes = comment.

                likesInfoData.likes = likesInfoData.likes.filter((like) => !like.isBanned)
            likesInfoData.dislikes = likesInfoData.dislikes.filter((dislike) => !dislike.isBanned)

            let myStatus: LikeType = 'None'

            // check that comment was liked current user
            if (likesInfoData.likes.some((el: LikeObjectType) => el.userId === userId)) {
                myStatus = 'Like'
            }

            //check that comment was disliked current user
            if (likesInfoData.dislikes.some((el: LikeObjectType) => el.userId === userId)) {
                myStatus = 'Dislike'
            }

            // return a comment with defualt likesInfo
            const convertedComment = this.transformCommentWithDefaultLikeInfo(comment)

            // modify likes info
            convertedComment.likesInfo = {
                likesCount: likesInfoData.likes.length,
                dislikesCount: likesInfoData.dislikes.length,
                myStatus: myStatus
            }

            return convertedComment
        })

        return convertedComments
    } */

    async getCorrectUserIdByAccessToken(accessToken: string | null): Promise<string | null> {
        if (accessToken) {
            const jwtResult = await this.jwtService.verifyAccessToken(accessToken)
            return jwtResult ? jwtResult.userId : null
        }
    }
}