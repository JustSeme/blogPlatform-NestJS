import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import { PostEntity } from "../../../domain/posts/typeORM/post.entity"
import {
    DataSource, Repository
} from "typeorm"
import { ReadPostsQueryParams } from "../../../../blogs/api/models/ReadPostsQuery"
import { PostsViewModel } from "../../../../blogs/application/dto/PostViewModel"
import { PostLikesInfo } from "../../../domain/posts/typeORM/post-likes-info"

@Injectable()
export class PostsQueryTypeORMRepository {
    constructor(
        @InjectRepository(PostEntity)
        private postsRepostiory: Repository<PostEntity>,
        @InjectDataSource() private dataSource: DataSource
    ) { }

    async getPostById(postId: string): Promise<PostEntity> {
        try {

            const findedPost = await this.postsRepostiory
                .findOne({
                    where: {
                        id: postId,
                        isBanned: false
                    },
                    relations: { blog: true }
                })

            return findedPost
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async getPostByIdWithLikesInfo(postId: string, userId: string): Promise<PostsViewModel> {
        try {
            const findedPostData = await this.postsRepostiory
                .createQueryBuilder('pe')
                .where('pe.id = :postId', { postId })
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
                                .andWhere(`pli.likeStatus = 'Like'`)
                                .andWhere('pli.postId = pe.id')
                                .orderBy(`pli.createdAt`, 'DESC')
                                .limit(3)
                        }, 'agg'), 'newestLikes'
                )
                .getRawMany()

            return this.mappingPosts(findedPostData)[0]
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async isPostExists(postId: string): Promise<boolean> {
        try {
            const postById = await this.postsRepostiory.findOne({ where: { id: postId } })

            return postById ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async findPosts(queryParams: ReadPostsQueryParams, userId: string) {
        const {
            sortDirection = 'DESC',
            sortBy = 'createdAt',
            pageNumber = 1,
            pageSize = 10
        } = queryParams

        const totalCount = await this.postsRepostiory.countBy({ isBanned: false })
        const pagesCount = Math.ceil(totalCount / +pageSize)
        const skipCount = (+pageNumber - 1) * +pageSize

        let displayedPosts: PostsViewModel[]

        try {
            const resultedPosts = await this.postsRepostiory
                .createQueryBuilder('pe')
                .where('pe.isBanned = false')
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
                                .andWhere(`pli.likeStatus = 'Like'`)
                                .andWhere('pli.postId = pe.id')
                                .orderBy(`pli.createdAt`, 'DESC')
                                .limit(3)
                        }, 'agg'), 'newestLikes'
                )
                .orderBy(`pe.${sortBy}`, sortDirection)
                .limit(pageSize)
                .offset(skipCount)
                .getRawMany()

            displayedPosts = this.mappingPosts(resultedPosts)
        } catch (err) {
            console.error(err)
            throw new Error('Something wrong with database, try again later...')
        }

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: displayedPosts
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

        let displayedPosts: PostsViewModel[]

        try {
            const resultedPosts = await this.postsRepostiory
                .createQueryBuilder('pe')
                .where('pe.isBanned = false')
                .andWhere('pe.blog = :blog', { blog: blogId })
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
                                .andWhere(`pli.likeStatus = 'Like'`)
                                .andWhere('pli.postId = pe.id')
                                .orderBy(`pli.createdAt`, 'DESC')
                                .limit(3)
                        }, 'agg'), 'newestLikes'
                )
                .orderBy(`pe.${sortBy}`, sortDirection)
                .limit(pageSize)
                .offset(skipCount)
                .getRawMany()

            displayedPosts = this.mappingPosts(resultedPosts)
        } catch (err) {
            console.error(err)
            throw new Error('Something wrong with database, try again later...')
        }

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: displayedPosts
        }
    }

    mappingPosts(rawPosts: any[]): PostsViewModel[] {
        return rawPosts.map((post) => ({
            id: post.pe_id,
            title: post.pe_title,
            shortDescription: post.pe_shortDescription,
            content: post.pe_content,
            blogId: post.pe_blogId,
            blogName: post.pe_blogName,
            createdAt: post.pe_createdAt,
            extendedLikesInfo: {
                likesCount: +post.likesCount,
                dislikesCount: +post.dislikesCount,
                myStatus: post.myStatus || 'None',
                newestLikes: post.newestLikes || []
            }
        }))
    }
}