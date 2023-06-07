import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadBlogsQueryParams } from "../../../blogs/api/models/ReadBlogsQuery"
import { BlogsWithQuerySuperAdminOutputModel } from "../dto/BlogSuperAdminViewModel"
import { BlogsQuerySQLRepository } from "../../../Blogger/infrastructure/blogs/blogs-query-sql-repository"

export class GetBlogsForSuperAdminCommand {
    constructor(
        public readonly blogsQueryParams: ReadBlogsQueryParams,
    ) { }
}

@CommandHandler(GetBlogsForSuperAdminCommand)
export class GetBlogsForSuperAdminUseCase implements ICommandHandler<GetBlogsForSuperAdminCommand> {
    constructor(
        private blogsQueryRepository: BlogsQuerySQLRepository
    ) { }


    async execute(command: GetBlogsForSuperAdminCommand): Promise<BlogsWithQuerySuperAdminOutputModel> {
        return this.blogsQueryRepository.findBlogsForSuperAdmin(command.blogsQueryParams)
    }
}