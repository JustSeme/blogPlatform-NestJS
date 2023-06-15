import { HydratedDocument } from "mongoose"
import { Comment } from "../../domain/comments/mongoose/Comments.schema"

export type HydratedComment = HydratedDocument<Comment>