import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadCommentsQueryParams } from "../../../../blogs/api/models/ReadCommentsQuery"
import { BlogsRepository } from "../../../infrastructure/blogs/blogs-db-repository"
import { CommentsRepository } from "../../../../blogs/infrastructure/comments/comments-db-repository"
import { CommentsService } from "../../../../blogs/application/comments-service"
import { ReadBlogsQueryParams } from "../../../../blogs/api/models/ReadBlogsQuery"
import { CommentsForBloggerWithQueryOutputModel } from "../../../../blogs/application/dto/CommentViewModelForBlogger"

export class GetAllCommentsForBloggerBlogsCommand {
    constructor(
        public readCommentsQuery: ReadCommentsQueryParams,
        public bloggerId: string
    ) { }
}

@CommandHandler(GetAllCommentsForBloggerBlogsCommand)
export class GetAllCommentsForBloggerBlogsUseCase implements ICommandHandler<GetAllCommentsForBloggerBlogsCommand> {
    constructor(
        private blogsRepository: BlogsRepository,
        private commentsRepository: CommentsRepository,
        private commentsService: CommentsService,
    ) { }

    async execute(command: GetAllCommentsForBloggerBlogsCommand): Promise<CommentsForBloggerWithQueryOutputModel> {
        // если передать пустой объект в findBlogs как queryParams, то подставятся дефолтные значения
        const allBlogsForBlogger = await this.blogsRepository.findBlogs({} as ReadBlogsQueryParams, command.bloggerId)

        const blogIds = allBlogsForBlogger.items.map((blog) => blog.id)

        const commentsWithQueryData = await this.commentsRepository.getAllCommentsByAllBlogIds(command.readCommentsQuery, blogIds)

        commentsWithQueryData.items = this.commentsService.transformCommentsForBloggerDisplay(commentsWithQueryData.items)

        return commentsWithQueryData
    }
}