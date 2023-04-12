import { PostInputModel } from '../../api/models/PostInputModel'
import { ReadPostsQueryParams } from '../../api/models/ReadPostsQuery'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose/dist'
import { Post } from 'src/blogs/domain/posts/PostsSchema'
import {
    ExtendedLikeObjectType, PostDBModel, PostModelType
} from 'src/blogs/domain/posts/PostsTypes'
import { PostDocument } from './PostsTypes'

@Injectable()
export class PostsRepository {
    constructor(@InjectModel(Post.name) private PostModel: PostModelType) { }

    async findPosts(queryParams: ReadPostsQueryParams, blogId: string | null) {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10
        } = queryParams

        const filter: any = {}
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
        return await this.PostModel.findOne({ id: postId })
    }

    async deletePosts(id: string) {
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