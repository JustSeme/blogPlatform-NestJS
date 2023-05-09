import { HydratedDocument } from "mongoose"
import { Blog } from "../../domain/blogs/BlogsSchema"

export type BlogDocument = HydratedDocument<Blog>