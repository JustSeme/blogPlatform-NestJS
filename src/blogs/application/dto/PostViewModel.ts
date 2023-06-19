import { PostEntity } from "../../../Blogger/domain/posts/typeORM/post.entity"
import { LikeType } from "../../api/models/LikeInputModel"

export class PostsViewModel {
    public id: string
    public title: string
    public shortDescription: string
    public content: string
    public blogId: string
    public blogName: string
    public createdAt: Date
    public extendedLikesInfo: ExtendedLikesInfoViewType

    constructor(rawPost: PostEntity) {
        this.id = rawPost.id
        this.title = rawPost.title
        this.shortDescription = rawPost.shortDescription
        this.content = rawPost.content
        this.blogId = rawPost.blogId as string
        this.blogName = rawPost.blogName
        this.createdAt = rawPost.createdAt
        this.extendedLikesInfo = {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: []
        }
    }

}

type ExtendedLikesInfoViewType = {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeType,
    newestLikes: NewestLikesType[]
}

type NewestLikesType = {
    addedAt: string,
    userId: string,
    login: string
}