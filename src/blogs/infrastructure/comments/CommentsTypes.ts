import { HydratedDocument } from "mongoose"
import { Comment } from "../../domain/comments/mongoose/Comments.schema"
import { CommentEntity } from "../../domain/comments/typeORM/comment.entity"
import { CommentLikesInfo } from "../../domain/comments/typeORM/comment-likes-info.entity"

export type HydratedComment = HydratedDocument<Comment>

export type CommentEntitiesType = CommentEntity | CommentLikesInfo