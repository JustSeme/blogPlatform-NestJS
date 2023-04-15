import { HydratedDocument } from "mongoose"
import { Post } from "../../domain/posts/PostsSchema"

export type PostDocument = HydratedDocument<Post>