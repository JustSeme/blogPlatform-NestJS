import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import {
    PostDTO, PostSQLModel
} from "../../domain/posts/PostsTypes"
import { PostsViewModel } from "../../../blogs/application/dto/PostViewModel"

@Injectable()
export class PostsSQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createPost(creatingPost: PostDTO): Promise<PostsViewModel> {
        const queryString = `
            INSERT INTO public.post_entity
                (title, "shortDescription", "content", "blogName", "ownerLogin", "blogId", "ownerId")
                VALUES($1, $2, $3, $4, $5, $6, $7);
        `

        const selectString = `
            SELECT *
                FROM public.post_entity
                WHERE "title" = $1 AND "ownerId" = #2
        `

        try {
            await this.dataSource.query(queryString, [
                creatingPost.title,
                creatingPost.shortDescription,
                creatingPost.content,
                creatingPost.blogName,
                creatingPost.postOwnerInfo.userLogin,
                creatingPost.blogId,
                creatingPost.postOwnerInfo.userId,
            ])

            const createdPost: PostSQLModel[] = await this.dataSource.query(selectString, [creatingPost.title, creatingPost.postOwnerInfo.userId])

            if (!createdPost[0]) {
                return null
            }

            return new PostsViewModel(createdPost[0])
        } catch (err) {
            console.error(err)
            return null
        }
    }
}