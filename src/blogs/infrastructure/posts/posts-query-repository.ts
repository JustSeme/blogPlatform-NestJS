import { InjectModel } from "@nestjs/mongoose"
import { ReadPostsQueryParams } from "../../api/models/ReadPostsQuery"
import { Injectable } from "@nestjs/common"
import {
    PostDBModel, PostModelType
} from "../../domain/posts/PostsTypes"
import { Post } from "../../domain/posts/PostsSchema"

@Injectable()
export class PostsQueryRepository {
    constructor(
        @InjectModel(Post.name) private PostModel: PostModelType
    ) { }

    async findPosts(queryParams: ReadPostsQueryParams, blogId: string | null) {
        const {
            sortDirection = 'desc', sortBy = 'createdAt', pageNumber = 1, pageSize = 10
        } = queryParams

        const filter: any = {}
        if (blogId) {
            filter.blogId = blogId
        }

        const totalCount = await this.PostModel.count(filter)
        const pagesCount = Math.ceil(totalCount / +pageSize)

        const skipCount = (+pageNumber - 1) * +pageSize
        const sortDirectionNumber = sortDirection === 'asc' ? 1 : -1
        const resultedPosts = await this.PostModel.find(filter, {
            _id: 0, __v: 0
        }).skip(skipCount).limit(+pageSize).sort({ [sortBy]: sortDirectionNumber }).lean()

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: resultedPosts
        }
    }

    async getPostById(postId: string): Promise<PostDBModel> {
        return await this.PostModel.findOne({ id: postId }).lean()
    }
}