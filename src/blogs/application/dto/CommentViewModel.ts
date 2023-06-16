import { LikeType } from "../../api/models/LikeInputModel"
import { CommentLikesInfo } from "../../domain/comments/typeORM/comment-likes-info.entity"
import { CommentEntity } from "../../domain/comments/typeORM/comment.entity"

export type LikesInfoViewType = {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeType
}

export class CommentViewModel {
    public id: string
    public content: string
    public commentatorInfo: CommentatorInfoType
    public createdAt: Date
    public likesInfo: LikesInfoViewType

    constructor(rawComment: CommentEntity & CommentLikesInfo | CommentEntity) {
        this.id = rawComment.id
        this.content = rawComment.content

        this.commentatorInfo = {
            userId: String(rawComment.commentatorId) as string,
            userLogin: rawComment.commentatorLogin
        }
        this.createdAt = rawComment.createdAt
        this.likesInfo = {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None'
        }
    }

}

type CommentatorInfoType = {
    userId: string
    userLogin: string
}

export type CommentsWithQueryOutputModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: CommentViewModel[]
}