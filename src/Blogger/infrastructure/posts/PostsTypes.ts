import { HydratedDocument } from "mongoose"
import { Post } from "../../domain/posts/mongoose/PostsSchema"

export type HydratedPost = HydratedDocument<Post>