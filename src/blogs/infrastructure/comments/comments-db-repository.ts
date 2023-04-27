import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Comment } from "../../domain/comments/commentsSchema"
import {
    CommentDBModel, CommentModelType, LikeObjectType
} from "../../domain/comments/CommentTypes"

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

    async getCommentById(commentId: string) {
        return this.CommentModel.findOne({ id: commentId }).lean()
    }

    async setLike(likeData: LikeObjectType, commentId: string) {
        const likedComment = await this.CommentModel.findOne({ id: commentId })
        if (!likedComment) return false

        likedComment.likesInfo.likes.push(likeData)

        await likedComment.save()
        return true
    }

    async setDislike(likeData: LikeObjectType, commentId: string) {
        const dislikedComment = await this.CommentModel.findOne({ id: commentId })
        if (!dislikedComment) return false

        // TODO Почитать про $push mongoose

        dislikedComment.likesInfo.dislikes.push(likeData)

        await dislikedComment.save()
        return true
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

    async isCommentExists(commentId: string): Promise<boolean> {
        const commentById = await this.CommentModel.findOne({ id: commentId })
        return commentById ? true : false
    }
}