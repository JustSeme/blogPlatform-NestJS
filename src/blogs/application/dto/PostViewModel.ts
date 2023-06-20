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

    constructor(rawPost: PostEntity & ExtendedLikesInfoViewType) {
        const mappedNewestLikes = rawPost.newestLikes.map((like) => ({
            addedAt: like.addedAt,
            userId: like.userId,
            login: like.login
        }))

        this.id = rawPost.id
        this.title = rawPost.title
        this.shortDescription = rawPost.shortDescription
        this.content = rawPost.content
        this.blogId = rawPost.blogId as string
        this.blogName = rawPost.blogName
        this.createdAt = rawPost.createdAt
        this.extendedLikesInfo = {
            likesCount: +rawPost.likesCount || 0,
            dislikesCount: +rawPost.dislikesCount || 0,
            myStatus: rawPost.myStatus || 'None',
            newestLikes: mappedNewestLikes || []
        }
    }

}

export type ExtendedLikesInfoViewType = {
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