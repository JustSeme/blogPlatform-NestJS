import { LikeType } from "../../api/models/LikeInputModel"
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

    constructor(rawComment: CommentEntity & { dislikesCount: number, likesCount: number, likeStatus: LikeType }) {
        this.id = rawComment.id
        this.content = rawComment.content

        this.commentatorInfo = {
            userId: String(rawComment.commentatorId) as string,
            userLogin: rawComment.commentatorLogin
        }
        this.createdAt = rawComment.createdAt
        this.likesInfo = {
            likesCount: rawComment.likesCount,
            dislikesCount: rawComment.dislikesCount,
            myStatus: rawComment.likeStatus
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