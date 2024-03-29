import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { CommentViewModel } from "../../dto/CommentViewModel"
import { ForbiddenException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers/helpers"
import { BlogsQueryTypeORMRepository } from "../../../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { CommentEntity } from "../../../domain/typeORM/comment.entity"
import { UsersTypeORMQueryRepository } from "../../../../SuperAdmin/infrastructure/typeORM/users-typeORM-query-repository"
import { PostsQueryTypeORMRepository } from "../../../../Blogger/infrastructure/posts/typeORM/posts-query-typeORM-repository"
import { CommentsTypeORMRepository } from "../../../infrastructure/typeORM/comments-typeORM-repository"

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
        const blog = await this.blogsQueryRepository.findOnlyUnbannedBlogById(post.blog.id)
        const banUserForBlog = await this.blogsQueryRepository.findBanUserForBlogByUserIdAndBlogId(command.commentatorId, post.blog.id)

        if (!commentator) {
            return null
        }

        if (banUserForBlog) {
            throw new ForbiddenException(generateErrorsMessages(`You are banned for this blog by reason: ${banUserForBlog.banReason}`, 'commentator'))
        }

        const creatingComment = new CommentEntity()
        creatingComment.content = command.content
        creatingComment.post = post
        creatingComment.commentator = commentator
        creatingComment.commentatorLogin = commentator.login
        creatingComment.createdAt = new Date()
        creatingComment.postTitle = post.title
        creatingComment.blog = blog
        creatingComment.blogName = post.blogName

        const createdComment = await this.commentsRepository.dataSourceSave(creatingComment)
        return new CommentViewModel({
            ...createdComment as CommentEntity,
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
        })
    }
}
