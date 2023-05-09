import { v4 as uuidv4 } from "uuid"
import { PostsViewModel } from "../../../blogs/application/dto/PostViewModel"
import { Model } from "mongoose"
import { Post } from "./PostsSchema"

//data transfer object
export class PostDBModel {
    public id: string
    public createdAt: string
    public extendedLikesInfo: ExtendedLikesInfoDBType
    public postOwnerInfo: PostOwnerInfoType

    constructor(
        public title: string,
        public shortDescription: string,
        public content: string,
        public blogId: string,
        public blogName: string,
        userId: string,
        userLogin: string,
        public isBanned: boolean,
    ) {
        this.id = uuidv4()
        this.createdAt = new Date().toISOString()

        this.postOwnerInfo = {
            userId,
            userLogin
        }

        this.extendedLikesInfo = {
            likes: [],
            dislikes: [],
            noneEntities: []
        }
    }
}

export type PostsWithQueryOutputModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: PostsViewModel[]
}

export type ExtendedLikesInfoDBType = {
    likes: ExtendedLikeObjectType[],
    dislikes: ExtendedLikeObjectType[],
    noneEntities: ExtendedLikeObjectType[]
}

export type ExtendedLikeObjectType = {
    userId: string
    createdAt: string
    login: string
    isBanned: boolean
}

export type PostOwnerInfoType = {
    userId: string,
    userLogin: string
}

export type PostModelType = Model<Post>