import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import {
    PostDBModel,
    PostDTO
} from "../../domain/posts/PostsTypes"
import { PostsViewModel } from "../../../blogs/application/dto/PostViewModel"
import { PostInputModel } from "../../api/models/PostInputModel"
import { PostEntity } from "../../domain/posts/post.entity"

@Injectable()
export class PostsSQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async unHideAllLikeEntitiesForPostsByUserId(userId: string) {
        return true
    }

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

            const createdPost: PostEntity[] = await this.dataSource.query(selectString, [creatingPost.title, creatingPost.postOwnerInfo.userId])

            if (!createdPost[0]) {
                return null
            }

            return new PostsViewModel(createdPost[0])
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async getPostById(postId: string): Promise<PostDBModel> {
        const queryString = `
            SELECT *
                FROM public."post_entity"
                WHERE id = $1 AND "isBanned" = false
        `

        try {
            const postData = this.dataSource.query(queryString, [postId])

            if (!postData[0]) {
                return null
            }

            return new PostDBModel(postData[0])
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async deletePost(id: string): Promise<boolean> {
        const queryString = `
            DELETE FROM public."post_entity"
                WHERE id=$1;
        `

        try {
            await this.dataSource.query(queryString, [id])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async hideAllPostsForCurrentUser(userId: string): Promise<boolean> {
        const queryString = `
            UPDATE public."post_entity"
                SET "isBanned"=true
                WHERE "ownerId"=$1
        `

        try {
            await this.dataSource.query(queryString, [userId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async unhideAllPostsForCurrentUser(userId: string): Promise<boolean> {
        const queryString = `
            UPDATE public."post_entity"
                SET "isBanned"=false
                WHERE "ownerId"=$1
        `

        try {
            await this.dataSource.query(queryString, [userId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async updatePost(postId: string, body: PostInputModel): Promise<boolean> {
        const queryString = `
            UPDATE public."post_enity"
                SET "title"=$2, "shortDescription"=$3, "content"=$4
                WHERE id=$1
        `

        try {
            await this.dataSource.query(queryString, [postId, body.title, body.shortDescription, body.content])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async isPostExists(postId: string): Promise<boolean> {
        const queryString = `
            SELECT *
                FROM public."post_entity"
                WHERE id = $1
        `

        try {
            const postData = await this.dataSource.query(queryString, [postId])

            if (!postData[0]) {
                return false
            }

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async hidePostsByBlogId(blogId: string): Promise<boolean> {
        const queryString = `
            UPDATE public."post_entity"
                SET "isBanned"=true
                WHERE "blogId"=$1
        `

        try {
            await this.dataSource.query(queryString, [blogId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async unhidePostsByBlogId(blogId: string): Promise<boolean> {
        const queryString = `
            UPDATE public."post_entity"
                SET "isBanned"=false
                WHERE "blogId"=$1
        `

        try {
            await this.dataSource.query(queryString, [blogId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}