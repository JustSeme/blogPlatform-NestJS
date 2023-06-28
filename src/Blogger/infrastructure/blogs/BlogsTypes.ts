import { HydratedDocument } from "mongoose"
import { Blog } from "../../domain/blogs/BlogsSchema"
import { BansUsersForBlogs } from "../../domain/blogs/bans-users-for-blogs.entity"
import { BlogEntity } from "../../domain/blogs/blog.entity"

export type BlogDocument = HydratedDocument<Blog>

export type BlogsEntitiesType = BlogEntity | BansUsersForBlogs