import { HydratedDocument } from "mongoose"
import { Post } from "../../domain/posts/mongoose/PostsSchema"
import { PostEntity } from "../../domain/posts/typeORM/post.entity"
import { PostLikesInfo } from "../../domain/posts/typeORM/post-likes-info"

export type HydratedPost = HydratedDocument<Post>

export type PostEnitiesType = PostEntity | PostLikesInfo 