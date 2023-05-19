import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ReadBannedUsersQueryParams } from "../../../api/models/ReadBannedUsersQueryParams"
import { BannedUsersOutputModel } from "../../dto/BannedUserViewModel"
import { UsersQueryRepository } from "../../../../SuperAdmin/infrastructure/users-query-repository"
import { BloggerService } from "../../blogger.service"

export class GetAllBannedUsersForBlogCommand {
    constructor(
        public blogId: string,
        public readBannedUsersQuery: ReadBannedUsersQueryParams
    ) { }
}


@CommandHandler(GetAllBannedUsersForBlogCommand)
export class GetAllBannedUsersForBlogUseCase implements ICommandHandler<GetAllBannedUsersForBlogCommand> {
    constructor(
        private usersQueryRepository: UsersQueryRepository,
        private bloggerService: BloggerService,
    ) { }


    async execute(command: GetAllBannedUsersForBlogCommand): Promise<BannedUsersOutputModel> {
        const findedUsersQueryData = await this.usersQueryRepository.findBannedUsersByBlogId(command.readBannedUsersQuery, command.blogId)
        const preparedUsers = this.bloggerService.prepareUsersForBloggerDisplay(findedUsersQueryData.items, command.blogId)
        return {
            ...findedUsersQueryData,
            items: preparedUsers
        }
    }

}