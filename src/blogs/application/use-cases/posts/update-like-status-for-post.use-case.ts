import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { LikeType } from "../../../api/models/LikeInputModel"
import { PostsRepository } from "../../../../Blogger/infrastructure/posts/posts-db-repository"
import { ExtendedLikeObjectType } from "../../../../Blogger/domain/posts/PostsTypes"
import { UsersRepository } from "../../../../SuperAdmin/infrastructure/users-db-repository"

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
        private postsRepository: PostsRepository,
        private usersRepository: UsersRepository,
    ) { }

    async execute(command: UpdateLikeStatusForPostCommand) {
        const {
            userId,
            postId,
            status,
        } = command

        const updatablePost = await this.postsRepository.getPostById(postId)
        if (!updatablePost) {
            return false
        }

        const likedUser = await this.usersRepository.findUserById(userId)
        const likeData: ExtendedLikeObjectType = {
            createdAt: new Date().toISOString(),
            userId: userId,
            login: likedUser.login,
            isBanned: false,
        }

        const likeIndex = updatablePost.extendedLikesInfo.likes.findIndex((like: ExtendedLikeObjectType) => like.userId === userId)
        const dislikeIndex = updatablePost.extendedLikesInfo.dislikes.findIndex((dislike: ExtendedLikeObjectType) => dislike.userId === userId)
        const noneIndex = updatablePost.extendedLikesInfo.noneEntities.findIndex((none: ExtendedLikeObjectType) => none.userId === userId)

        if (status === 'None') {
            if (noneIndex > -1) {
                // Сущность None уже существует, не нужно её обновлять
                return true
            }
            return this.postsRepository.setNone(updatablePost, likeIndex, dislikeIndex)
        }

        if (status === 'Like') {
            if (likeIndex > -1) {
                // Лайк уже есть, не нужно его создавать, возвращаем true
                return true
            }

            if (dislikeIndex > -1 || noneIndex > -1) {
                // Сущность дизлайка уже есть. Нужно обновить её, а не создавать новую
                return this.postsRepository.updateToLike(updatablePost, dislikeIndex, noneIndex)
            }

            return this.postsRepository.createLike(likeData, updatablePost)
        }

        if (status === 'Dislike') {
            if (dislikeIndex > -1) {
                // Дизлайк уже есть, не нужно его создавать
                return true
            }

            if (likeIndex > -1 || noneIndex > -1) {
                // Сущность лайка уже есть. Нужно обновить её, а не создавать новую
                return this.postsRepository.updateToDislike(updatablePost, likeIndex, noneIndex)
            }

            return this.postsRepository.createDislike(likeData, updatablePost)
        }
    }
}