import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { PostEntity } from "../../../domain/posts/typeORM/post.entity"
import { Repository } from "typeorm"
import { PostLikesInfo } from "../../../domain/posts/typeORM/post-likes-info"

@Injectable()
export class PostsTypeORMRepository {
    constructor(
        @InjectRepository(PostEntity)
        private postsRepository: Repository<PostEntity>,
        @InjectRepository(PostLikesInfo)
        private postLikesInfoRepository: Repository<PostLikesInfo>,
    ) { }

    async unHideAllLikeEntitiesForPostsByUserId(userId: string): Promise<boolean> {
        try {
            const updateResult = await this.postLikesInfoRepository
                .update({ user: { id: userId } }, { isBanned: false })

            return updateResult ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async hideAllLikeEntitiesForPostsByUserId(userId: string): Promise<boolean> {
        try {
            const updateResult = await this.postLikesInfoRepository
                .update({ user: { id: userId } }, { isBanned: true })

            return updateResult ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async deletePost(id: string): Promise<boolean> {
        try {
            const deleteResult = await this.postsRepository.delete({ id })

            return deleteResult ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async hideAllPostsForCurrentUser(userId: string): Promise<boolean> {
        try {
            const updateResult = await this.postsRepository.update({ owner: { id: userId } }, { isBanned: true })

            return updateResult ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async unhideAllPostsForCurrentUser(userId: string): Promise<boolean> {
        try {
            const updateResult = await this.postsRepository.update({ owner: { id: userId } }, { isBanned: false })

            return updateResult ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async hidePostsByBlogId(blogId: string): Promise<boolean> {
        try {
            const updateResult = await this.postsRepository.update({ blog: { id: blogId } }, { isBanned: true })

            return updateResult ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async unHidePostsByBlogId(blogId: string): Promise<boolean> {
        try {
            const updateResult = await this.postsRepository.update({ blog: { id: blogId } }, { isBanned: false })

            return updateResult ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }
}