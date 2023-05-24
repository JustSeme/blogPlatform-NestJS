import { LikeType } from "../../api/models/LikeInputModel"

export type LikesInfoViewType = {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeType
}

export type CommentViewModel = {
    id: string
    content: string,
    commentatorInfo: {
        userId: string
        userLogin: string
    },
    createdAt: string,
    likesInfo: LikesInfoViewType
}

export type CommentsWithQueryOutputModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: CommentViewModel[]
}