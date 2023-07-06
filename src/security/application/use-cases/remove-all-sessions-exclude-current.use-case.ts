import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { DevicesTypeORMRepository } from "../../infrastructure/typeORM/devices-typeORM-repository"

export class RemoveAllSessionsExcludeCurrentCommand {
    constructor(
        public readonly userId: string,
        public readonly deviceId: string
    ) { }
}

@CommandHandler(RemoveAllSessionsExcludeCurrentCommand)
export class RemoveAllSessionsExcludeCurrentUseCase implements ICommandHandler<RemoveAllSessionsExcludeCurrentCommand> {
    constructor(
        private readonly deviceRepository: DevicesTypeORMRepository
    ) { }

    async execute(command: RemoveAllSessionsExcludeCurrentCommand): Promise<void> {
        await this.deviceRepository.deleteAllSessionsExcludeCurrent(command.userId, command.deviceId)
    }
}
