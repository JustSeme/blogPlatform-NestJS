import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadBannedUsersQueryParams } from "../../../api/models/ReadBannedUsersQueryParams"
import { BannedUsersOutputModel } from "../../dto/BannedUserViewModel"
import {
    BadRequestException, ForbiddenException
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../../general/helpers"
import { BlogsQueryTypeORMRepository } from "../../../infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { UsersTypeORMQueryRepository } from "../../../../SuperAdmin/infrastructure/typeORM/users-typeORM-query-repository"

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
        private usersQueryRepository: UsersTypeORMQueryRepository,
        private blogsQueryRepository: BlogsQueryTypeORMRepository,
    ) { }


    async execute(command: GetAllBannedUsersForBlogCommand): Promise<BannedUsersOutputModel> {
        const blogById = await this.blogsQueryRepository.findOnlyUnbannedBlogById(command.blogId)

        if (!blogById) {
            throw new BadRequestException('This blog is banned')
        }

        if (blogById.user.id !== command.currentUserId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        return this.usersQueryRepository.findBannedUsersByBlogId(command.readBannedUsersQuery, command.blogId)
    }
}