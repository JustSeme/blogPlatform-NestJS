import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { DevicesSQLRepository } from "../../infrastructure/devices-sql-repository"

export class RemoveAllSessionsExcludeCurrentCommand {
    constructor(
        public readonly userId: string,
        public readonly deviceId: string
    ) { }
}

@CommandHandler(RemoveAllSessionsExcludeCurrentCommand)
export class RemoveAllSessionsExcludeCurrentUseCase implements ICommandHandler<RemoveAllSessionsExcludeCurrentCommand> {
    constructor(
        private readonly deviceRepository: DevicesSQLRepository
    ) { }

    async execute(command: RemoveAllSessionsExcludeCurrentCommand): Promise<void> {
        await this.deviceRepository.deleteAllSessionsExcludeCurrent(command.userId, command.deviceId)
    }
}
