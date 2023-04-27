import { Injectable } from "@nestjs/common"
import { BlogDBModel } from "../domain/blogs/BlogsTypes"
import { BlogViewModel } from "./dto/BlogViewModel"

@Injectable()
export class BlogsService {

    // TODO Понять почему не ругается если возвращаю BlogDBModel там, где надо вернуть BlogViewModel
    prepareBlogForDisplay(rawBlog: BlogDBModel): BlogViewModel {
        const displayedBlog = {
            id: rawBlog.id,
            createdAt: rawBlog.createdAt,
            name: rawBlog.name,
            description: rawBlog.description,
            websiteUrl: rawBlog.websiteUrl,
            isMembership: rawBlog.isMembership,
        }

        return displayedBlog
    }
}