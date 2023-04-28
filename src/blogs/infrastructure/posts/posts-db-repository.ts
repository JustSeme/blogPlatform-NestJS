import { PostInputModel } from '../../api/models/PostInputModel'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose/dist'
import { PostDocument } from './PostsTypes'
import { Post } from '../../domain/posts/PostsSchema'
import {
    ExtendedLikeObjectType, PostDBModel, PostModelType
} from '../../domain/posts/PostsTypes'

@Injectable()
export class PostsRepository {
    constructor(@InjectModel(Post.name) private PostModel: PostModelType) { }

    async getPostById(postId: string) {
        return await this.PostModel.findOne({ id: postId })
    }

    async deletePost(id: string) {
        const result = await this.PostModel.deleteOne({ id: id })
        return result.deletedCount === 1
    }

    async createPost(createdPost: PostDBModel) {
        await this.PostModel.create(createdPost)
    }

    async updatePost(id: string, body: PostInputModel) {
        const result = await this.PostModel.updateOne({ id: id }, {
            $set: {
                content: body.content, title: body.title, shortDescription: body.shortDescription, blogId: body.blogId
            }
        })
        return result.matchedCount === 1
    }

    async createLike(likeData: ExtendedLikeObjectType, likedPost: PostDocument) {
        likedPost.extendedLikesInfo.likes.push(likeData)

        await likedPost.save()
        return true
    }

    async createDislike(likeData: ExtendedLikeObjectType, dislikedPost: PostDocument) {
        dislikedPost.extendedLikesInfo.dislikes.push(likeData)

        await dislikedPost.save()
        return true
    }

    async setNone(editablePost: PostDocument, likeIndex: number, dislikeIndex: number) {
        if (likeIndex > -1) {
            const noneData = editablePost.extendedLikesInfo.likes.splice(likeIndex, 1)[0]
            editablePost.extendedLikesInfo.noneEntities.push(noneData)
        }

        if (dislikeIndex > -1) {
            const noneData = editablePost.extendedLikesInfo.dislikes.splice(dislikeIndex, 1)[0]
            editablePost.extendedLikesInfo.noneEntities.push(noneData)
        }

        await editablePost.save()
        return true
    }

    async updateToLike(updatablePost: PostDocument, dislikeIndex: number, noneIndex: number) {
        if (noneIndex > -1) {
            const likeData = updatablePost.extendedLikesInfo.noneEntities.splice(noneIndex, 1)[0]
            updatablePost.extendedLikesInfo.likes.push(likeData)
        }

        if (dislikeIndex > -1) {
            const likeData = updatablePost.extendedLikesInfo.dislikes.splice(dislikeIndex, 1)[0]
            updatablePost.extendedLikesInfo.likes.push(likeData)
        }

        await updatablePost.save()
        return true
    }

    async updateToDislike(updatablePost: PostDocument, likeIndex: number, noneIndex: number) {
        if (noneIndex > -1) {
            const dislikeData = updatablePost.extendedLikesInfo.noneEntities.splice(noneIndex, 1)[0]
            updatablePost.extendedLikesInfo.dislikes.push(dislikeData)
        }

        if (likeIndex > -1) {
            const dislikeData = updatablePost.extendedLikesInfo.likes.splice(likeIndex, 1)[0]
            updatablePost.extendedLikesInfo.dislikes.push(dislikeData)
        }

        await updatablePost.save()
        return true
    }

    async isPostExists(postId: string) {
        const postById = await this.PostModel.findOne({ id: postId })
        return postById ? true : false
    }
}