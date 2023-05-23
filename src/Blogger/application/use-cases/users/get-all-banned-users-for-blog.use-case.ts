import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadBannedUsersQueryParams } from "../../../api/models/ReadBannedUsersQueryParams"
import { BannedUsersOutputModel } from "../../dto/BannedUserViewModel"
import { UsersQueryRepository } from "../../../../SuperAdmin/infrastructure/users-query-repository"
import { BloggerService } from "../../blogger.service"
import { BlogsRepository } from "../../../infrastructure/blogs/blogs-db-repository"
import { ForbiddenException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"

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
        private usersQueryRepository: UsersQueryRepository,
        private bloggerService: BloggerService,
        private blogsRepository: BlogsRepository,
    ) { }


    async execute(command: GetAllBannedUsersForBlogCommand): Promise<BannedUsersOutputModel> {
        const blogById = await this.blogsRepository.findBlogById(command.blogId)

        if (!blogById.isCurrentUserOwner(command.currentUserId)) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        const findedUsersQueryData = await this.usersQueryRepository.findBannedUsersByBlogId(command.readBannedUsersQuery, command.blogId)
        const preparedUsers = this.bloggerService.prepareUsersForBloggerDisplay(findedUsersQueryData.items, command.blogId)
        return {
            ...findedUsersQueryData,
            items: preparedUsers
        }
    }

}