import { PostInputModel } from '../../api/models/PostInputModel'
import {
    Injectable, NotImplementedException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose/dist'
import { Post } from '../../domain/posts/PostsSchema'
import {
    ExtendedLikeObjectType, PostDBModel, PostModelType
} from '../../domain/posts/PostsTypes'
import { HydratedPost } from './PostsTypes'
import { ReadPostsQueryParams } from '../../../blogs/api/models/ReadPostsQuery'

@Injectable()
export class PostsRepository {
    constructor(@InjectModel(Post.name) private PostModel: PostModelType) { }

    async findPosts(queryParams: ReadPostsQueryParams, blogId: string | null) {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10
        } = queryParams

        const filter: any = { isBanned: false }
        if (blogId) {
            filter.blogId = blogId
        }

        const totalCount = await this.PostModel.count(filter)
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize
        const sortDirectionNumber = sortDirection === 'asc' ? 1 : -1
        const resultedPosts = await this.PostModel.find(filter, {
            _id: 0, __v: 0
        }).skip(skipCount).limit(+pageSize).sort({ [sortBy]: sortDirectionNumber }).lean()

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: resultedPosts
        }
    }

    async getPostById(postId: string) {
        return await this.PostModel.findOne({ $and: [{ id: postId }, { isBanned: false }] })
    }

    async deletePost(id: string) {
        const result = await this.PostModel.deleteOne({ id: id })
        return result.deletedCount === 1
    }

    async hideAllPostsForCurrentUser(userId: string): Promise<boolean> {
        const result = await this.PostModel.updateMany({ "postOwnerInfo.userId": userId }, { $set: { isBanned: true } })
        return result.upsertedCount > 0 ? true : false
    }

    async unHideAllPostsForCurrentUser(userId: string): Promise<boolean> {
        const result = await this.PostModel.updateMany({ "postOwnerInfo.userId": userId }, { $set: { isBanned: false } })
        return result.upsertedCount > 0 ? true : false
    }

    async createPost(createdPost: PostDBModel) {
        await this.PostModel.create(createdPost)
    }

    async save(post: HydratedPost) {
        return post.save()
    }

    async updatePost(id: string, body: PostInputModel) {
        const result = await this.PostModel.updateOne({ id: id }, {
            $set: {
                content: body.content, title: body.title, shortDescription: body.shortDescription, blogId: body.blogId
            }
        })
        return result.matchedCount === 1
    }

    async createLike(likeData: ExtendedLikeObjectType, likedPost: HydratedPost) {
        likedPost.extendedLikesInfo.likes.push(likeData)

        await this.save(likedPost)
        return true
    }

    async createDislike(likeData: ExtendedLikeObjectType, dislikedPost: HydratedPost) {
        dislikedPost.extendedLikesInfo.dislikes.push(likeData)

        await this.save(dislikedPost)
        return true
    }

    async setNone(editablePost: HydratedPost, likeIndex: number, dislikeIndex: number) {
        if (likeIndex > -1) {
            const noneData = editablePost.extendedLikesInfo.likes.splice(likeIndex, 1)[0]
            editablePost.extendedLikesInfo.noneEntities.push(noneData)
        }

        if (dislikeIndex > -1) {
            const noneData = editablePost.extendedLikesInfo.dislikes.splice(dislikeIndex, 1)[0]
            editablePost.extendedLikesInfo.noneEntities.push(noneData)
        }

        await this.save(editablePost)
        return true
    }

    async updateToLike(updatablePost: HydratedPost, dislikeIndex: number, noneIndex: number) {
        if (noneIndex > -1) {
            const likeData = updatablePost.extendedLikesInfo.noneEntities.splice(noneIndex, 1)[0]
            updatablePost.extendedLikesInfo.likes.push(likeData)
        }

        if (dislikeIndex > -1) {
            const likeData = updatablePost.extendedLikesInfo.dislikes.splice(dislikeIndex, 1)[0]
            updatablePost.extendedLikesInfo.likes.push(likeData)
        }

        await this.save(updatablePost)
        return true
    }

    async updateToDislike(updatablePost: HydratedPost, likeIndex: number, noneIndex: number) {
        if (noneIndex > -1) {
            const dislikeData = updatablePost.extendedLikesInfo.noneEntities.splice(noneIndex, 1)[0]
            updatablePost.extendedLikesInfo.dislikes.push(dislikeData)
        }

        if (likeIndex > -1) {
            const dislikeData = updatablePost.extendedLikesInfo.likes.splice(likeIndex, 1)[0]
            updatablePost.extendedLikesInfo.dislikes.push(dislikeData)
        }

        await this.save(updatablePost)
        return true
    }

    async isPostExists(postId: string) {
        const postById = await this.PostModel.findOne({ id: postId })
        return postById ? true : false
    }

    async hideAllLikeEntitiesForPostsByUserId(userId) {
        try {
            await this.PostModel.updateMany(
                { "extendedLikesInfo.dislikes.userId": userId },
                { "$set": { "extendedLikesInfo.dislikes.$.isBanned": true } },
            )

            await this.PostModel.updateMany(
                { "extendedLikesInfo.likes.userId": userId },
                { "$set": { "extendedLikesInfo.likes.$.isBanned": true } },
            )
            return true
        }
        catch (err) {
            throw new NotImplementedException(`hideLikeEntities for post is not implemented by error: ${err}`)
        }
    }

    async unHideAllLikeEntitiesForPostsByUserId(userId) {
        try {
            await this.PostModel.updateMany(
                { "extendedLikesInfo.dislikes.userId": userId },
                { "$set": { "extendedLikesInfo.dislikes.$.isBanned": false } },
            )

            await this.PostModel.updateMany(
                { "extendedLikesInfo.likes.userId": userId },
                { "$set": { "extendedLikesInfo.likes.$.isBanned": false } },
            )
            return true
        }
        catch (err) {
            throw new NotImplementedException(`unHideLikeEntities for post is not implemented by error: ${err}`)
        }
    }

    async hidePostsByBlogId(blogId: string) {
        const isUpdatedData = await this.PostModel.updateMany({ blogId: blogId }, { isBanned: true })
        return isUpdatedData.matchedCount > 0
    }

    async unHidePostsByBlogId(blogId: string) {
        const isUpdatedData = await this.PostModel.updateMany({ blogId: blogId }, { isBanned: false })
        return isUpdatedData.matchedCount > 0
    }
}