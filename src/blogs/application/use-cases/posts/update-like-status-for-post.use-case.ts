import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { LikeType } from "../../../api/models/LikeInputModel"
import { UsersQuerySQLRepository } from "../../../../SuperAdmin/infrastructure/users-query-sql-repository"
import { PostsSQLRepository } from "../../../../Blogger/infrastructure/posts/posts-sql-repository"

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
        private postsRepository: PostsSQLRepository,
        private usersQueryRepository: UsersQuerySQLRepository,
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

        const likedUser = await this.usersQueryRepository.findUserById(userId)

        const isLikeEntityExists = this.postsRepository.isLikeEntityExists(userId, postId)

        if (isLikeEntityExists) {
            return this.postsRepository.updateLikeStatus(userId, postId, status)
        } else {
            switch (status) {
                case "Like":
                    return this.postsRepository.createLike(userId, postId, likedUser.login)
                case "Dislike":
                    return this.postsRepository.createDislike(userId, postId, likedUser.login)
            }
        }


    }
}