import {
    CommandHandler, ICommandHandler
} from '@nestjs/cqrs'
import { DeviceSessionsViewModel } from '../dto/DeviceSessionsViewModel'
import { DeviceRepository } from '../../infrastructure/device-db-repository'
import { generateErrorsMessages } from '../../../general/helpers'
import { NotFoundException } from '@nestjs/common'
import { SecurityService } from '../security-service'

export class GetActiveDevicesCommand {
    constructor(public readonly userId: string) { }
}

@CommandHandler(GetActiveDevicesCommand)
export class GetActiveDevicesUseCase implements ICommandHandler<GetActiveDevicesCommand> {
    constructor(
        private readonly deviceRepository: DeviceRepository,
        private readonly securityService: SecurityService,
    ) { }

    public async execute(command: GetActiveDevicesCommand): Promise<DeviceSessionsViewModel[]> {
        const activeSessionsForUser = await this.deviceRepository.getDevicesForUser(command.userId)
        if (!activeSessionsForUser) {
            throw new NotFoundException(generateErrorsMessages('Active devices is not found', 'none'))
        }

        if (!activeSessionsForUser) {
            return null
        }
        const displayedActiveSessionsForUser: Array<DeviceSessionsViewModel> = this.securityService.prepareDevicesForDisplay(activeSessionsForUser)

        return displayedActiveSessionsForUser
    }
}