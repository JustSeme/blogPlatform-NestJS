import { ReadOutputQuery } from "../../../general/types/ReadQuery"
import { CommentatorInfoType } from "../../domain/comments/CommentTypes"
import { LikesInfoViewType } from "./CommentViewModel"
import { PostInfoType } from "./PostInfoType"

export type CommentsForBloggerWithQueryOutputModel = ReadOutputQuery & {
    items: Array<CommentViewModelForBlogger>
}

export type CommentViewModelForBlogger = {
    id: string
    content: string
    commentatorInfo: CommentatorInfoType
    createdAt: string
    postInfo: PostInfoType
    likesInfo: LikesInfoViewType
}

