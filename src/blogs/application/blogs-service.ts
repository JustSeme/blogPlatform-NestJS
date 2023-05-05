import { Injectable } from "@nestjs/common"
import { BlogDBModel } from "../domain/blogs/BlogsTypes"
import { BlogViewModel } from "./dto/BlogViewModel"

@Injectable()
export class BlogsService {

    prepareBlogForDisplay(rawBlogs: Array<BlogDBModel | BlogViewModel>): BlogViewModel[] {
        const displayedBlogs = rawBlogs.map((rawBlog: BlogDBModel) => {
            return {
                id: rawBlog.id,
                createdAt: rawBlog.createdAt,
                name: rawBlog.name,
                description: rawBlog.description,
                websiteUrl: rawBlog.websiteUrl,
                isMembership: rawBlog.isMembership,
            }
        })
        return displayedBlogs
    }
}