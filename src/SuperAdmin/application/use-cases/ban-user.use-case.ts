import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { UsersRepository } from "../../../general/users/infrastructure/users-db-repository"
import { BanInputModel } from "../../api/models/BanInputModel"
import { DeviceRepository } from '../../../security/infrastructure/device-db-repository'

export class BanUserCommand {
    constructor(
        public readonly banInputModel: BanInputModel,
        public readonly userId: string,
    ) { }
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
    constructor(
        private usersRepository: UsersRepository,
        private deviceRepository: DeviceRepository,
    ) { }

    async execute(command: BanUserCommand) {
        const {
            banInputModel,
            userId,
        } = command

        const userById = await this.usersRepository.findUserById(userId)

        const isBanned = userById.banCurrentUser(banInputModel)
        if (isBanned) {
            await this.usersRepository.save(userById)
        }

        /* this.deviceRepository. */
    }
}