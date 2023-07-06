import { LikeType } from "../../api/models/LikeInputModel"
import { CommentEntity } from "../../domain/typeORM/comment.entity"

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

    constructor(rawComment: CommentEntity & LikesInfoViewType) {
        this.id = rawComment.id
        this.content = rawComment.content

        this.commentatorInfo = {
            userId: String(rawComment.commentator.id),
            userLogin: rawComment.commentatorLogin
        }
        this.createdAt = rawComment.createdAt
        this.likesInfo = {
            likesCount: +rawComment.likesCount || 0,
            dislikesCount: +rawComment.dislikesCount || 0,
            myStatus: rawComment.myStatus || 'None'
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