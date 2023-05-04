import { LikeType } from '../api/models/LikeInputModel'
import { PostsViewModel } from './dto/PostViewModel'
import { Injectable } from '@nestjs/common'
import {
    ExtendedLikeObjectType, PostDBModel
} from '../domain/posts/PostsTypes'
import { JwtService } from '../../general/adapters/jwt.adapter'

@Injectable()
export class PostsService {
    constructor(
        private jwtService: JwtService
    ) { }

    transformPostWithDefaultLikesInfo(rawPost: PostDBModel): PostsViewModel {
        return {
            id: rawPost.id,
            content: rawPost.content,
            title: rawPost.title,
            shortDescription: rawPost.shortDescription,
            blogId: rawPost.blogId,
            blogName: rawPost.blogName,
            createdAt: rawPost.createdAt,
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: []
            }
        }
    }

    async transformPostsForDisplay(postsArray: PostDBModel[], accessToken: string | null): Promise<PostsViewModel[]> {
        let userId: string | null = null
        if (accessToken) {
            const jwtResult = await this.jwtService.verifyAccessToken(accessToken)
            userId = jwtResult ? jwtResult.userId : null
        }

        const convertedPosts: PostsViewModel[] = []
        postsArray.forEach((post: PostDBModel) => {
            if (post.isBanned) {
                return
            }

            const likesInfoData = post.extendedLikesInfo

            const likesInfoDataWithoutBannedEntities = {
                likes: [],
                dislikes: []
            }

            likesInfoDataWithoutBannedEntities.likes = likesInfoData.likes.filter((like) => !like.isBanned)

            likesInfoDataWithoutBannedEntities.dislikes = likesInfoData.dislikes.filter((dislike) => !dislike.isBanned)

            let myStatus: LikeType = 'None'

            // check that post was liked current user
            if (likesInfoDataWithoutBannedEntities.likes.some((el: ExtendedLikeObjectType) => el.userId === userId)) {
                myStatus = 'Like'
            }

            //check that post was disliked current user
            if (likesInfoDataWithoutBannedEntities.dislikes.some((el: ExtendedLikeObjectType) => el.userId === userId)) {
                myStatus = 'Dislike'
            }

            const last3Likes = likesInfoDataWithoutBannedEntities.likes.sort((like1, like2) => {
                if (like1.createdAt > like2.createdAt) {
                    return -1
                } else {
                    return 1
                }
            }).slice(0, 3)

            const newest3Likes = last3Likes.map((like: ExtendedLikeObjectType) => {
                return {
                    addedAt: like.createdAt,
                    userId: like.userId,
                    login: like.login
                }
            })

            const convertedPost: PostsViewModel = this.transformPostWithDefaultLikesInfo(post)

            convertedPost.extendedLikesInfo = {
                likesCount: likesInfoDataWithoutBannedEntities.likes.length,
                dislikesCount: likesInfoDataWithoutBannedEntities.dislikes.length,
                myStatus: myStatus,
                newestLikes: newest3Likes
            }

            convertedPosts.push(convertedPost)
        })

        return convertedPosts
    }
}