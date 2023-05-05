import { HydratedDocument } from "mongoose"
import { CommentEntity } from "../../domain/comments/CommentsSchema"

export type HydratedComment = HydratedDocument<CommentEntity>