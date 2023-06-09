import { PostsViewModel } from "../../../blogs/application/dto/PostViewModel"
import { Model } from "mongoose"
import { Post } from "./mongoose/PostsSchema"
import { PostEntity } from "./typeORM/post.entity"

//data transfer object
export class PostDTO {
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

export class PostDBModel {
    public id: string
    public createdAt: Date
    public extendedLikesInfo: ExtendedLikesInfoDBType
    public postOwnerInfo: PostOwnerInfoType
    public title: string
    public shortDescription: string
    public content: string
    public blogId: string
    public blogName: string
    public isBanned: boolean


    constructor(rawPost: PostEntity) {
        this.id = rawPost.id
        this.createdAt = rawPost.createdAt

        this.extendedLikesInfo = {
            likes: [],
            dislikes: [],
            noneEntities: []
        }

        this.postOwnerInfo = {
            userId: rawPost.owner as string,
            userLogin: rawPost.ownerLogin
        }

        this.title = rawPost.title
        this.shortDescription = rawPost.shortDescription
        this.content = rawPost.content
        this.blogId = rawPost.blog.id
        this.blogName = rawPost.blogName
        this.isBanned = rawPost.isBanned
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