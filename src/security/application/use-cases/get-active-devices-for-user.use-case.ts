import {
    CommandHandler, ICommandHandler
} from '@nestjs/cqrs'
import { DeviceSessionsViewModel } from '../dto/DeviceSessionsViewModel'
import { generateErrorsMessages } from '../../../general/helpers/helpers'
import { NotFoundException } from '@nestjs/common'
import { SecurityService } from '../security-service'
import { DevicesTypeORMRepository } from '../../infrastructure/typeORM/devices-typeORM-repository'

export class GetActiveDevicesCommand {
    constructor(public readonly userId: string) { }
}

@CommandHandler(GetActiveDevicesCommand)
export class GetActiveDevicesUseCase implements ICommandHandler<GetActiveDevicesCommand> {
    constructor(
        private readonly deviceRepository: DevicesTypeORMRepository,
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