import { ReadOutputQuery } from "../../../general/types/ReadQuery"
import { LikeType } from "../../api/models/LikeInputModel"
import { CommentatorInfoType } from "../../domain/comments/CommentTypes"
import { CommentEntity } from "../../domain/comments/typeORM/comment.entity"
import { LikesInfoViewType } from "./CommentViewModel"
import { PostInfoType } from "./PostInfoType"

export type CommentsForBloggerWithQueryOutputModel = ReadOutputQuery & {
    items: Array<CommentViewModelForBlogger>
}

export class CommentViewModelForBlogger {
    public id: string
    public content: string
    public commentatorInfo: CommentatorInfoType
    public createdAt: Date
    public postInfo: PostInfoType
    public likesInfo: LikesInfoViewType

    constructor(rawComment: CommentEntity & { dislikesCount: number, likesCount: number, likeStatus: LikeType }) {
        this.id = rawComment.id
        this.content = rawComment.content

        this.commentatorInfo = {
            userId: String(rawComment.commentatorId),
            userLogin: rawComment.commentatorLogin
        }

        this.createdAt = rawComment.createdAt

        this.postInfo = {
            blogId: String(rawComment.blogId),
            blogName: rawComment.blogName,
            id: String(rawComment.postId),
            title: rawComment.postTitle
        }

        this.likesInfo = {
            likesCount: +rawComment.likesCount || 0,
            dislikesCount: +rawComment.dislikesCount || 0,
            myStatus: rawComment.likeStatus || 'None'
        }
    }

}

