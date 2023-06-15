import {
    Injectable, NotImplementedException
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import {
    CommentDBModel, CommentModelType, LikeObjectType
} from "../../domain/comments/CommentTypes"
import { HydratedComment } from "./CommentsTypes"
import { Comment } from "../../domain/comments/mongoose/Comments.schema"
import { ReadCommentsQueryParams } from "../../api/models/ReadCommentsQuery"
import { ReadOutputQuery } from "../../../general/types/ReadQuery"

@Injectable()
export class CommentsRepository {
    constructor(@InjectModel(Comment.name) protected CommentModel: CommentModelType) { }

    async createComment(createdComment: CommentDBModel) {
        await this.CommentModel.create(createdComment)
    }

    async deleteComment(commentId: string) {
        const result = await this.CommentModel.deleteOne({ id: commentId })
        return result.deletedCount === 1
    }

    async updateComment(commentId: string, content: string) {
        const result = await this.CommentModel.updateOne({ id: commentId }, { content: content })
        return result.matchedCount === 1
    }

    async getComments(queryParams: ReadCommentsQueryParams, postId: string): Promise<any> {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10
        } = queryParams

        const filter: any = {
            'postInfo.id': postId,
            isBanned: false
        }

        const totalCount = await this.CommentModel.count(filter)
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const sortDirectionNumber = sortDirection === 'asc' ? 1 : -1
        const resultedComments = await this.CommentModel.find(filter, {
            _id: 0, postId: 0, __v: 0
        }).sort({ [sortBy]: sortDirectionNumber }).skip(skipCount).limit(+pageSize).lean()

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: resultedComments
        }
    }

    async getCommentById(commentId: string) {
        return this.CommentModel.findOne({ id: commentId }).lean()
    }

    async setLike(likeData: LikeObjectType, commentId: string) {
        const updateResult = await this.CommentModel.updateOne({ id: commentId }, { $push: { 'likesInfo.likes': likeData } })
        return updateResult.matchedCount === 1
    }

    async setDislike(likeData: LikeObjectType, commentId: string) {
        const updateResult = await this.CommentModel.updateOne({ id: commentId }, { $push: { 'likesInfo.dislikes': likeData } })
        return updateResult.matchedCount === 1
    }

    async setNoneLike(userId: string, commentId: string) {
        const editableComment = await this.CommentModel.findOne({ id: commentId })
        if (!editableComment) return false

        // TODO Почитать про $pull mongoose
        const likeIndex = editableComment.likesInfo.likes.findIndex((like) => like.userId === userId)
        const dislikeIndex = editableComment.likesInfo.dislikes.findIndex((dislike) => dislike.userId === userId)

        if (likeIndex > -1) {
            editableComment.likesInfo.likes.splice(likeIndex, 1)

            await editableComment.save()
            return true
        }

        if (dislikeIndex > -1) {
            editableComment.likesInfo.dislikes.splice(dislikeIndex, 1)

            await editableComment.save()
            return true
        }
    }

    async save(comment: HydratedComment) {
        return comment.save()
    }

    async isCommentExists(commentId: string): Promise<boolean> {
        const commentById = await this.CommentModel.findOne({ id: commentId })
        return commentById ? true : false
    }

    async hideAllCommentsForCurrentUser(userId: string): Promise<boolean> {
        const result = await this.CommentModel.updateMany({ "commentatorInfo.userId": userId }, { $set: { isBanned: true } })
        return result.upsertedCount > 0 ? true : false
    }

    async unHideAllCommentsForCurrentUser(userId: string): Promise<boolean> {
        const result = await this.CommentModel.updateMany({ "commentatorInfo.userId": userId }, { $set: { isBanned: false } })
        return result.upsertedCount > 0 ? true : false
    }

    async hideAllLikeEntitiesForCommentsByUserId(userId: string): Promise<boolean> {
        try {
            await this.CommentModel.updateMany(
                { "likesInfo.likes.userId": userId },
                { "$set": { "likesInfo.likes.$.isBanned": true } },
            )
            await this.CommentModel.updateMany(
                { "likesInfo.dislikes.userId": userId },
                { "$set": { "likesInfo.dislikes.$.isBanned": true } },
            )
            return true
        } catch (err) {
            console.dir('hideLikeEntities for comment is not implimented by error', err)
            throw new NotImplementedException(`hideLikeEntities for comment is not implimented by error: ${err}`)
        }
    }

    async unHideAllLikeEntitiesForCommentsByUserId(userId: string): Promise<boolean> {
        try {
            await this.CommentModel.updateMany(
                { "likesInfo.likes.userId": userId },
                { "$set": { "likesInfo.likes.$.isBanned": false } },
            )
            await this.CommentModel.updateMany(
                { "likesInfo.dislikes.userId": userId },
                { "$set": { "likesInfo.dislikes.$.isBanned": false } },
            )
            return true
        } catch (err) {
            console.dir('hideLikeEntities for comment is not implimented by error', err)
            throw new NotImplementedException(`unHideLikeEntities for comment is not implimented by error: ${err}`)
        }
    }

    async getAllCommentsByAllBlogIds(readCommentsQuery: ReadCommentsQueryParams, blogIds: string[]): Promise<ReadOutputQuery & { items: CommentDBModel[] }> {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10
        } = readCommentsQuery

        const blogIdFilterObjects = blogIds.map((blogId: string) => ({ 'postInfo.blogId': blogId }))

        const filter: any = {
            isBanned: false,
            $or: blogIdFilterObjects
        }

        const totalCount = await this.CommentModel.count(filter)
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const sortDirectionNumber = sortDirection === 'asc' ? 1 : -1
        const resultedComments = await this.CommentModel.find(filter, {
            _id: 0, 'postInfo._id': 0, 'commentatorInfo._id': 0, __v: 0
        }).sort({ [sortBy]: sortDirectionNumber }).skip(skipCount).limit(+pageSize).lean()

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: resultedComments
        }
    }
}