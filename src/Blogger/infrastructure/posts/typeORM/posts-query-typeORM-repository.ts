import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { PostEntity } from "../../../domain/posts/typeORM/post.entity"
import { Repository } from "typeorm"
import { ReadPostsQueryParams } from "../../../../blogs/api/models/ReadPostsQuery"
import {
    ExtendedLikesInfoViewType, PostsViewModel
} from "../../../../blogs/application/dto/PostViewModel"
import { PostLikesInfo } from "../../../domain/posts/typeORM/post-likes-info"

@Injectable()
export class PostsQueryTypeORMRepository {
    constructor(
        @InjectRepository(PostEntity)
        private postsRepostiory: Repository<PostEntity>
    ) { }

    async getPostById(postId: string): Promise<PostEntity> {
        try {
            return this.postsRepostiory.findOneOrFail({ where: { id: postId } })
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async isPostExists(postId: string): Promise<boolean> {
        try {
            const postById = await this.getPostById(postId)

            return postById ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async findPostsForBlog(queryParams: ReadPostsQueryParams, blogId: string, userId: string) {
        const {
            sortDirection = 'DESC',
            sortBy = 'createdAt',
            pageNumber = 1,
            pageSize = 10
        } = queryParams

        const totalCount = await this.postsRepostiory.countBy({
            isBanned: false,
            blog: { id: blogId }
        })
        const pagesCount = Math.ceil(totalCount / +pageSize)
        const skipCount = (+pageNumber - 1) * +pageSize

        const resultedPosts = await this.postsRepostiory
            .createQueryBuilder('pe')
            .where('pe.isBanned = false')
            .andWhere('pe.blog = :blog', { blog: { id: blogId } })
            .addSelect(
                (qb) => qb
                    .select('count(*)')
                    .from(PostLikesInfo, 'pli')
                    .where('pli.postId = pe.id')
                    .andWhere('pli.isBanned = false')
                    .andWhere(`pli.likeStatus = 'Dislike'`), 'dislikesCount'
            )
            .addSelect(
                (qb) => qb
                    .select('count(*)')
                    .from(PostLikesInfo, 'pli')
                    .where('pli.postId = pe.id')
                    .andWhere('pli.isBanned = false')
                    .andWhere(`pli.likeStatus = 'Like'`), 'likesCount'
            )
            .addSelect(
                (qb) => qb
                    .select('pli.likeStatus')
                    .from(PostLikesInfo, 'pli')
                    .where('pli.userId = :userId', { userId })
                    .andWhere('pli.postId = pe.id'), 'myStatus'
            )
            .addSelect(
                (qb) => qb
                    .select(`jsonb_agg(json_build_object('addedAt', agg."createdAt", 'userId', agg."userId", 'login', agg."ownerLogin" ))`)
                    .from((qb) => {
                        return qb
                            .select('pli.createdAt, pli.userId, pli.ownerLogin')
                            .from(PostLikesInfo, 'pli')
                            .where('pli.isBanned = false')
                            .andWhere('pli.likeStatus = "Like"')
                            .andWhere('pli.postId = pe.id')
                            .orderBy(`pli.createdAt`, 'DESC')
                            .limit(3)
                    }, 'agg'), 'newestLikes'
            )
            .orderBy(`pe.${sortBy}`, sortDirection)
            .limit(pageSize)
            .offset(skipCount)
            .getRawMany()

        console.log(resultedPosts)

        //const displayedPosts = resultedPosts.map(post => new PostsViewModel(post))

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: resultedPosts
        }
    }
}