import { InjectModel } from "@nestjs/mongoose"
import { CommentViewModel } from "../../application/dto/CommentViewModel"
import { CommentModelType } from "../../domain/comments/CommentTypes"
import { CommentEntity } from "../../domain/comments/Comments.schema"

export class CommentsQueryRepository {
    constructor(
        @InjectModel(CommentEntity.name) protected CommentModel: CommentModelType) { }

    async findCommentById(commentId: string): Promise<CommentViewModel> {
        return this.CommentModel.findOne({ $and: [{ id: commentId }, { isBanned: false }] }, {
            _id: 0, postId: 0, __v: 0
        }).lean()
    }
}