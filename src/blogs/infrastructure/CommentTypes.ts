import { HydratedDocument } from "mongoose"
import { CommentLikesInfo } from "../domain/typeORM/comment-likes-info.entity"
import { CommentEntity } from "../domain/typeORM/comment.entity"
import { Comment } from "../domain/mongoose/Comments.schema"

export type CommentEntitiesType = CommentEntity | CommentLikesInfo

export type HydratedComment = HydratedDocument<Comment>