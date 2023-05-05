import { InjectModel } from "@nestjs/mongoose"
import { CommentViewModel } from "../../application/dto/CommentViewModel"
import { CommentModelType } from "../../domain/comments/CommentTypes"
import { ReadCommentsQueryParams } from "../../api/models/ReadCommentsQuery"
import { CommentEntity } from "../../domain/comments/Comments.schema"

export class CommentsQueryRepository {
    constructor(
        @InjectModel(CommentEntity.name) protected CommentModel: CommentModelType) { }

    async getComments(queryParams: ReadCommentsQueryParams, postId: string): Promise<any> {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10
        } = queryParams

        const filter: any = { postId: postId }

        const totalCount = await this.CommentModel.count(filter)
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize

        const sortDirectionNumber = sortDirection === 'asc' ? 1 : -1
        const resultedComments = await this.CommentModel.find(filter, {
            _id: 0, postId: 0, __v: 0
        }).skip(skipCount).limit(+pageSize).sort({ [sortBy]: sortDirectionNumber }).lean()

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: resultedComments
        }
    }

    async findCommentById(commentId: string): Promise<CommentViewModel> {
        return this.CommentModel.findOne({ id: commentId }, {
            _id: 0, postId: 0, __v: 0
        }).lean()
    }
}