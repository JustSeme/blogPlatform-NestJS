import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadBannedUsersQueryParams } from "../../../api/models/ReadBannedUsersQueryParams"
import { BannedUsersOutputModel } from "../../dto/BannedUserViewModel"
import { ForbiddenException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"
import { BlogsSQLRepository } from "../../../infrastructure/blogs/blogs-sql-repository"
import { UsersQuerySQLRepository } from "../../../../SuperAdmin/infrastructure/users-query-sql-repository"

export class GetAllBannedUsersForBlogCommand {
    constructor(
        public blogId: string,
        public readBannedUsersQuery: ReadBannedUsersQueryParams,
        public currentUserId: string,
    ) { }
}


@CommandHandler(GetAllBannedUsersForBlogCommand)
export class GetAllBannedUsersForBlogUseCase implements ICommandHandler<GetAllBannedUsersForBlogCommand> {
    constructor(
        private usersQueryRepository: UsersQuerySQLRepository,
        private blogsRepository: BlogsSQLRepository,
    ) { }


    async execute(command: GetAllBannedUsersForBlogCommand): Promise<BannedUsersOutputModel> {
        const blogById = await this.blogsRepository.findBlogById(command.blogId)

        if (blogById.blogOwnerInfo.userId !== command.currentUserId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        return this.usersQueryRepository.findBannedUsersByBlogId(command.readBannedUsersQuery, command.blogId)
    }
}