import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { LikeType } from "../../../api/models/LikeInputModel"
import { PostsQueryTypeORMRepository } from "../../../../Blogger/infrastructure/posts/typeORM/posts-query-typeORM-repository"
import { PostsTypeORMRepository } from "../../../../Blogger/infrastructure/posts/typeORM/posts-typeORM-repository"
import { PostLikesInfo } from "../../../../Blogger/domain/posts/typeORM/post-likes-info"
import { UsersTypeORMQueryRepository } from "../../../../SuperAdmin/infrastructure/typeORM/users-typeORM-query-repository"

export class UpdateLikeStatusForPostCommand {
    constructor(
        public readonly userId: string,
        public readonly postId: string,
        public readonly status: LikeType
    ) { }
}

@CommandHandler(UpdateLikeStatusForPostCommand)
export class UpdateLikeStatusForPostUseCase implements ICommandHandler<UpdateLikeStatusForPostCommand> {
    constructor(
        private postsRepository: PostsTypeORMRepository,
        private postsQueryRepository: PostsQueryTypeORMRepository,
        private usersQueryRepository: UsersTypeORMQueryRepository,
    ) { }

    async execute(command: UpdateLikeStatusForPostCommand) {
        const {
            userId,
            postId,
            status,
        } = command

        const updatablePost = await this.postsQueryRepository.getPostById(postId)
        if (!updatablePost) {
            return false
        }

        const likedUser = await this.usersQueryRepository.findUserData(userId)

        const isLikeEntityExists = await this.postsRepository.isLikeEntityExists(userId, postId)

        const likedPost = await this.postsQueryRepository.getPostById(postId)

        if (isLikeEntityExists) {
            return this.postsRepository.updateLikeStatus(userId, postId, status)
        } else {
            if (status === 'Like') {
                const creatingLikeEntity = new PostLikesInfo()
                creatingLikeEntity.user = likedUser
                creatingLikeEntity.post = likedPost
                creatingLikeEntity.ownerLogin = likedUser.login
                creatingLikeEntity.likeStatus = 'Like'

                const createdLike = this.postsRepository.dataSourceSave(creatingLikeEntity)

                return createdLike ? true : false
            }

            if (status === 'Dislike') {
                const creatingDislikeEntity = new PostLikesInfo()
                creatingDislikeEntity.user = likedUser
                creatingDislikeEntity.post = likedPost
                creatingDislikeEntity.ownerLogin = likedUser.login
                creatingDislikeEntity.likeStatus = 'Dislike'

                const createdDislike = this.postsRepository.dataSourceSave(creatingDislikeEntity)

                return createdDislike ? true : false
            }
        }
    }
}