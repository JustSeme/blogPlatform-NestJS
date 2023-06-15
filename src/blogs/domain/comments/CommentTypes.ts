import { Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { Comment } from './mongoose/Comments.schema'
import { PostInfoType } from '../../application/dto/PostInfoType'

export class CommentDBModel {
    public id: string
    public createdAt: string

    public commentatorInfo: CommentatorInfoType
    public likesInfo: LikesInfoType
    public postInfo: PostInfoType
    constructor(
        public content: string,
        postId: string,
        userId: string,
        userLogin: string,
        public isBanned: boolean,
        postTitle: string,
        blogId: string,
        blogName: string
    ) {
        this.id = uuidv4()
        this.createdAt = new Date().toISOString()

        this.commentatorInfo = {
            userId,
            userLogin
        }
        this.likesInfo = {
            likes: [],
            dislikes: [],
        }
        this.postInfo = {
            id: postId,
            title: postTitle,
            blogId,
            blogName
        }
    }
}

export type CommentatorInfoType = {
    userId: string
    userLogin: string
}

export type LikesInfoType = {
    likes: LikeObjectType[],
    dislikes: LikeObjectType[],
}

export type LikeObjectType = {
    userId: string
    createdAt: string
    isBanned: boolean
}

export type CommentModelType = Model<Comment>
