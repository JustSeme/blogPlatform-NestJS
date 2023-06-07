import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadCommentsQueryParams } from "../../../../blogs/api/models/ReadCommentsQuery"
import { CommentsRepository } from "../../../../blogs/infrastructure/comments/comments-db-repository"
import { CommentsService } from "../../../../blogs/application/comments-service"
import { CommentsForBloggerWithQueryOutputModel } from "../../../../blogs/application/dto/CommentViewModelForBlogger"
import { BlogsSQLRepository } from "../../../infrastructure/blogs/blogs-sql-repository"

export class GetAllCommentsForBloggerBlogsCommand {
    constructor(
        public readCommentsQuery: ReadCommentsQueryParams,
        public bloggerId: string,
    ) { }
}

@CommandHandler(GetAllCommentsForBloggerBlogsCommand)
export class GetAllCommentsForBloggerBlogsUseCase implements ICommandHandler<GetAllCommentsForBloggerBlogsCommand> {
    constructor(
        private blogsRepository: BlogsSQLRepository,
        private commentsRepository: CommentsRepository,
        private commentsService: CommentsService,
    ) { }

    async execute(command: GetAllCommentsForBloggerBlogsCommand): Promise<CommentsForBloggerWithQueryOutputModel> {
        const blogIds = await this.blogsRepository.findAllBlogIdsByCreatorId(command.bloggerId)

        const commentsWithQueryData = await this.commentsRepository.getAllCommentsByAllBlogIds(command.readCommentsQuery, blogIds)

        const transformedComments = await this.commentsService.transformCommentsForBloggerDisplay(commentsWithQueryData.items, command.bloggerId)

        return {
            ...commentsWithQueryData,
            items: transformedComments
        }
    }
}