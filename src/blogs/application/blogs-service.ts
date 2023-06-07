import { Injectable } from "@nestjs/common"
import { BlogDTO } from "../../Blogger/domain/blogs/BlogsTypes"
import { BlogViewModel } from "./dto/BlogViewModel"

@Injectable()
export class BlogsService {

    prepareBlogForDisplay(rawBlogs: Array<BlogDTO | BlogViewModel>): BlogViewModel[] {
        const displayedBlogs = rawBlogs.map((rawBlog: BlogDTO) => {
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