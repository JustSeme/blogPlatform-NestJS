import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import { PostEntity } from "../../../domain/posts/typeORM/post.entity"
import {
    DataSource, EntityManager, Repository
} from "typeorm"
import { PostLikesInfo } from "../../../domain/posts/typeORM/post-likes-info"
import { PostEnitiesType } from "../PostsTypes"

@Injectable()
export class PostsTypeORMRepository {
    constructor(
        @InjectRepository(PostEntity)
        private postsRepository: Repository<PostEntity>,
        @InjectRepository(PostLikesInfo)
        private postLikesInfoRepository: Repository<PostLikesInfo>,
        @InjectDataSource() private dataSource: DataSource
    ) { }

    async queryRunnerSave(
        entity: PostEnitiesType,
        queryRunnerManager: EntityManager
    ): Promise<PostEnitiesType> {
        try {
            return queryRunnerManager.save(entity)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async dataSourceSave(
        entity: PostEnitiesType
    ): Promise<PostEnitiesType> {
        try {
            return this.dataSource.manager.save(entity)
        } catch (err) {
            console.error(err)
            return null
        }
    }

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

    async updateIsBannedForPostsByBlogId(blogId: string, isBanned: boolean): Promise<boolean> {
        try {
            const updateResult = await this.postsRepository.update({ blog: { id: blogId } }, { isBanned: isBanned })

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

    async isLikeEntityExists(userId: string, postId: string): Promise<boolean> {
        try {
            const likeEntity = await this.postLikesInfoRepository.findOneBy({
                user: { id: userId },
                post: { id: postId }
            })

            return likeEntity ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async updateLikeStatus(userId: string, postId: string, likeStatus: string): Promise<boolean> {
        try {
            const updateResult = await this.postLikesInfoRepository.update({
                user: { id: userId },
                post: { id: postId }
            }, { likeStatus })

            return updateResult ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }
}