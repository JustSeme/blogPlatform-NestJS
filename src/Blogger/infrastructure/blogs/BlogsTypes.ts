import { HydratedDocument } from "mongoose"
import { Blog } from "../../domain/blogs/mongoose/BlogsSchema"
import { BansUsersForBlogs } from "../../domain/blogs/typeORM/bans-users-for-blogs.entity"
import { BlogEntity } from "../../domain/blogs/typeORM/blog.entity"

export type BlogDocument = HydratedDocument<Blog>

export type BlogsEntitiesType = BlogEntity | BansUsersForBlogs