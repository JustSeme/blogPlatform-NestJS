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

    async transformCommentsForDisplay(postsArray: PostDBModel[], accessToken: string | null): Promise<PostsViewModel[]> {
        let userId: string | null = null
        if (accessToken) {
            const jwtResult = await this.jwtService.verifyAccessToken(accessToken)
            userId = jwtResult ? jwtResult.userId : null
        }

        const convertedPosts = postsArray.map((post: PostDBModel) => {
            const likesInfoData = post.extendedLikesInfo

            let myStatus: LikeType = 'None'

            // check that post was liked current user
            if (likesInfoData.likes.some((el: ExtendedLikeObjectType) => el.userId === userId)) {
                myStatus = 'Like'
            }

            //check that post was disliked current user
            if (likesInfoData.dislikes.some((el: ExtendedLikeObjectType) => el.userId === userId)) {
                myStatus = 'Dislike'
            }

            const last3Likes = likesInfoData.likes.sort((like1, like2) => {
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

            const convertedPost: PostsViewModel = {
                id: post.id,
                content: post.content,
                title: post.title,
                shortDescription: post.shortDescription,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: likesInfoData.likes.length,
                    dislikesCount: likesInfoData.dislikes.length,
                    myStatus: myStatus,
                    newestLikes: newest3Likes
                }
            }

            return convertedPost
        })

        return convertedPosts
    }
}