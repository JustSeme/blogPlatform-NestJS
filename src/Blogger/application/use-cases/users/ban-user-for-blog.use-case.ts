import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanUserForBlogInputModel } from "../../../api/models/BanUserForBlogInputModel"
import { UsersRepository } from "../../../../SuperAdmin/infrastructure/users-db-repository"

export class BanUserForBlogCommand {
    constructor(
        public userId: string,
        public banUserForBlogInputModel: BanUserForBlogInputModel
    ) { }
}


@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase implements ICommandHandler<BanUserForBlogCommand> {
    constructor(
        private usersRepository: UsersRepository
    ) { }


    async execute(command: BanUserForBlogCommand) {
        await this.usersRepository.banUserForCurrentBlog(command.userId, command.banUserForBlogInputModel)
    }
}