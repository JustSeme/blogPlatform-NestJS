import { HydratedDocument } from "mongoose"
import { Blog } from "../domain/blogsSchema"

export type BlogDocument = HydratedDocument<Blog>