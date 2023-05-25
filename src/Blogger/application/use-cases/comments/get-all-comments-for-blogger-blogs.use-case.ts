import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadCommentsQueryParams } from "../../../../blogs/api/models/ReadCommentsQuery"
import { BlogsRepository } from "../../../infrastructure/blogs/blogs-db-repository"
import { CommentsRepository } from "../../../../blogs/infrastructure/comments/comments-db-repository"
import { CommentsService } from "../../../../blogs/application/comments-service"
import { CommentsForBloggerWithQueryOutputModel } from "../../../../blogs/application/dto/CommentViewModelForBlogger"

export class GetAllCommentsForBloggerBlogsCommand {
    constructor(
        public readCommentsQuery: ReadCommentsQueryParams,
        public bloggerId: string,
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
        const blogIds = await this.blogsRepository.findAllBlogIdsByCreatorId(command.bloggerId)

        const commentsWithQueryData = await this.commentsRepository.getAllCommentsByAllBlogIds(command.readCommentsQuery, blogIds)

        const transformedComments = await this.commentsService.transformCommentsForBloggerDisplay(commentsWithQueryData.items, command.bloggerId)

        return {
            ...commentsWithQueryData,
            items: transformedComments
        }
    }
}