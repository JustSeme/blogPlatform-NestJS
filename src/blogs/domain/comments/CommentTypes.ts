import { Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { Comment } from './commentsSchema'

export class CommentDBModel {
    public id: string
    public createdAt: string

    public commentatorInfo: CommentatorInfoType
    public likesInfo: LikesInfoType
    constructor(
        public content: string,
        public postId: string,
        userId: string,
        userLogin: string
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
}

export type CommentModelType = Model<Comment>
