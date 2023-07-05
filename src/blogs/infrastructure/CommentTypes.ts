import { HydratedDocument } from "mongoose"
import { CommentLikesInfo } from "../domain/comments/typeORM/comment-likes-info.entity"
import { CommentEntity } from "../domain/comments/typeORM/comment.entity"
import { Comment } from "../domain/comments/mongoose/Comments.schema"

export type CommentEntitiesType = CommentEntity | CommentLikesInfo

export type HydratedComment = HydratedDocument<Comment>