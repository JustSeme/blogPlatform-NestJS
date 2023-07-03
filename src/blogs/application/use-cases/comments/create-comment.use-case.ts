import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentViewModel } from "../../dto/CommentViewModel"
import { ForbiddenException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"
import { BlogsQueryTypeORMRepository } from "../../../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { CommentEntity } from "../../../domain/comments/typeORM/comment.entity"
import { UsersTypeORMQueryRepository } from "../../../../SuperAdmin/infrastructure/typeORM/users-typeORM-query-repository"
import { PostsQueryTypeORMRepository } from "../../../../Blogger/infrastructure/posts/typeORM/posts-query-typeORM-repository"
import { CommentsTypeORMRepository } from "../../../infrastructure/comments/typeORM/comments-typeORM-repository"
import { BlogEntity } from "../../../../Blogger/domain/blogs/blog.entity"

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
        private readonly commentsRepository: CommentsTypeORMRepository,
        private readonly usersQueryRepository: UsersTypeORMQueryRepository,
        private readonly blogsQueryRepository: BlogsQueryTypeORMRepository,
        private readonly postsQueryRepository: PostsQueryTypeORMRepository,
    ) { }

    async execute(command: CreateCommentCommand): Promise<CommentViewModel> {
        const commentator = await this.usersQueryRepository.findUserData(command.commentatorId)
        const post = await this.postsQueryRepository.getPostById(command.postId)

        const banUserForBlog = await this.blogsQueryRepository.findBanUserForBlogByUserIdAndBlogId(command.commentatorId, post.blogId as string)

        if (!commentator) {
            return null
        }

        if (banUserForBlog) {
            throw new ForbiddenException(generateErrorsMessages(`You are banned for this blog by reason: ${banUserForBlog.banReason}`, 'commentator'))
        }

        const creatingComment = new CommentEntity()
        creatingComment.content = command.content
        creatingComment.postId = post
        creatingComment.commentatorId = commentator
        creatingComment.commentatorLogin = commentator.login
        creatingComment.createdAt = new Date()
        creatingComment.postTitle = post.title
        creatingComment.blogId = post.blogId as BlogEntity
        creatingComment.blogName = post.blogName


        /* const creatingComment = new CommentDBModel(
            command.content,
            command.postId,
            command.commentatorId,
            commentator.login,
            false,
            post.title,
            post.blogId,
            post.blogName
        ) */

        const createdComment = await this.commentsRepository.dataSourceSave(creatingComment)
        return new CommentViewModel({
            ...createdComment as CommentEntity,
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
        })
    }
}
