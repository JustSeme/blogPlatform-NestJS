import { Injectable } from "@nestjs/common"
import { BlogDBModel } from "../domain/blogs/BlogsTypes"
import { BlogViewModel } from "./dto/BlogViewModel"

@Injectable()
export class BlogsService {

    // TODO Понять почему не ругается если возвращаю BlogDBModel там, где надо вернуть BlogViewModel
    prepareBlogForDisplay(rawBlog: BlogDBModel): BlogViewModel {
        const displayedBlog = new BlogViewModel(
            rawBlog.name,
            rawBlog.description,
            rawBlog.websiteUrl,
            rawBlog.isMembership)

        return displayedBlog
    }
}