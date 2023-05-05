import { HydratedDocument } from "mongoose"
import { CommentEntity } from "../../domain/comments/Comments.schema"

export type HydratedComment = HydratedDocument<CommentEntity>