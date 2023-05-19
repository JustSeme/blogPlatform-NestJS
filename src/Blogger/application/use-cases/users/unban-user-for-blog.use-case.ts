import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanUserForBlogInputModel } from "../../../api/models/BanUserForBlogInputModel"
import { UsersRepository } from "../../../../SuperAdmin/infrastructure/users-db-repository"

export class UnbanUserForBlogCommand {
    constructor(
        public userId: string,
        public banUserForBlogInputModel: BanUserForBlogInputModel
    ) { }
}


@CommandHandler(UnbanUserForBlogCommand)
export class UnbanUserForBlogUseCase implements ICommandHandler<UnbanUserForBlogCommand> {
    constructor(
        private usersRepository: UsersRepository
    ) { }


    async execute(command: UnbanUserForBlogCommand) {
        await this.usersRepository.unbanUserForCurrentBlog(command.userId, command.banUserForBlogInputModel.blogId)
    }
}