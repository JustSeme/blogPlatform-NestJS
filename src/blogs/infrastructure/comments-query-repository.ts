import { InjectModel } from "@nestjs/mongoose"
import { CommentViewModel } from "../api/models/CommentViewModel"
import { Comment } from "../domain/comments/commentsSchema"
import { CommentModelType } from "../domain/comments/CommentTypes"

export class CommentsQueryRepository {
    constructor(@InjectModel(Comment.name) protected CommentModel: CommentModelType) { }

    async findCommentById(commentId: string): Promise<CommentViewModel> {
        return this.CommentModel.findOne({ id: commentId }, {
            _id: 0, postId: 0, __v: 0
        }).lean()
    }
}