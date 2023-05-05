import { HydratedDocument } from "mongoose"
import { Comment } from '../../domain/comments/CommentsSchema'

export type HydratedComment = HydratedDocument<Comment>