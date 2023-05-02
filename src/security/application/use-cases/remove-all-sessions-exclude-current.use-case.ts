import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { DeviceRepository } from "../../infrastructure/device-db-repository"

export class RemoveAllSessionsExcludeCurrentCommand {
    constructor(
        public readonly userId: string,
        public readonly deviceId: string
    ) { }
}

@CommandHandler(RemoveAllSessionsExcludeCurrentCommand)
export class RemoveAllSessionsExcludeCurrentUseCase implements ICommandHandler<RemoveAllSessionsExcludeCurrentCommand> {
    constructor(
        private readonly deviceRepository: DeviceRepository
    ) { }

    async execute(command: RemoveAllSessionsExcludeCurrentCommand): Promise<void> {
        await this.deviceRepository.deleteAllSessionsExcludeCurrent(command.userId, command.deviceId)
    }
}
