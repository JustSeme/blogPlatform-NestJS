import { HydratedDocument } from "mongoose"
import { Post } from "src/blogs/domain/posts/PostsSchema"

export type PostDocument = HydratedDocument<Post>