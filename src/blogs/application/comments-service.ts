import { CommentViewModel } from "./dto/CommentViewModel"
import { LikeType } from "../api/models/LikeInputModel"
import { Injectable } from "@nestjs/common"
import {
    CommentDBModel, LikeObjectType
} from "../domain/comments/CommentTypes"
import { JwtService } from "../../general/adapters/jwt.adapter"

@Injectable()
export class CommentsService {
    constructor(
        protected jwtService: JwtService,
    ) { }

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

    async transformCommentsForDisplay(commentsArray: Array<CommentViewModel | CommentDBModel>, accessToken: string | null): Promise<CommentViewModel[]> {
        let userId: string | null = null
        if (accessToken) {
            const jwtResult = await this.jwtService.verifyAccessToken(accessToken)
            userId = jwtResult ? jwtResult.userId : null
        }

        const convertedComments = []
        commentsArray.forEach((comment: CommentDBModel) => {
            if (comment.isBanned) {
                return
            }
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

            // return a comment with defualt likesInfo
            const convertedComment = this.transformCommentWithDefaultLikeInfo(comment)

            // modify likes info
            convertedComment.likesInfo = {
                likesCount: likesInfoData.likes.length,
                dislikesCount: likesInfoData.dislikes.length,
                myStatus: myStatus
            }

            convertedComments.push(convertedComment)
        })

        return convertedComments
    }
}