import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadBlogsQueryParams } from "../../../blogs/api/models/ReadBlogsQuery"
import { BlogsWithQuerySuperAdminOutputModel } from "../dto/BlogSuperAdminViewModel"
import { BlogsRepository } from "../../../blogs/infrastructure/blogs/blogs-db-repository"

export class GetBlogsForSuperAdminCommand {
    constructor(
        public readonly blogsQueryParams: ReadBlogsQueryParams,
    ) { }
}

@CommandHandler(GetBlogsForSuperAdminCommand)
export class GetBlogsForSuperAdminUseCase implements ICommandHandler<GetBlogsForSuperAdminCommand> {
    constructor(
        private blogsRepository: BlogsRepository
    ) { }


    async execute(command: GetBlogsForSuperAdminCommand): Promise<BlogsWithQuerySuperAdminOutputModel> {
        return this.blogsRepository.findBlogsForSuperAdmin(command.blogsQueryParams)
    }
}