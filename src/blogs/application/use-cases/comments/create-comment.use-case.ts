import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentDBModel } from "../../../domain/comments/CommentTypes"
import { CommentViewModel } from "../../dto/CommentViewModel"
import { ForbiddenException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"
import { CommentsSQLRepository } from "../../../infrastructure/comments/comments-sql-repository"
import { PostsSQLRepository } from "../../../../Blogger/infrastructure/posts/posts-sql-repository"
import { UsersSQLRepository } from "../../../../SuperAdmin/infrastructure/rawSQL/users-sql-repository"
import { BansUsersForBlogs } from "../../../../Blogger/domain/blogs/bans-users-for-blogs.entity"

// Command
export class CreateCommentCommand {
    constructor(
        public content: string,
        public commentatorId: string,
        public postId: string,
    ) { }
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
    constructor(
        private readonly commentsRepository: CommentsSQLRepository,
        private readonly usersRepository: UsersSQLRepository,
        private readonly postsRepository: PostsSQLRepository,
    ) { }

    async execute(command: CreateCommentCommand): Promise<CommentViewModel> {
        const commentator = await this.usersRepository.findUserById(command.commentatorId)
        const bansUserForBlogs = await this.usersRepository.findUserBlogBansInfo(command.commentatorId)
        const post = await this.postsRepository.getPostById(command.postId)

        if (!commentator) {
            return null
        }

        if (bansUserForBlogs.length) {
            bansUserForBlogs.some((ban: BansUsersForBlogs) => {
                if (String(ban.blogId) === post.blogId) {
                    throw new ForbiddenException(generateErrorsMessages(`You are banned for this blog by reason: ${ban.banReason}`, 'commentator'))
                }
            })
        }

        const creatingComment = new CommentDBModel(
            command.content,
            command.postId,
            command.commentatorId,
            commentator.login,
            false,
            post.title,
            post.blogId,
            post.blogName
        )

        return this.commentsRepository.createComment(creatingComment)
    }
}
