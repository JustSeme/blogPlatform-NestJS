import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { ForbiddenException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers/helpers"
import { DevicesTypeORMRepository } from "../../infrastructure/typeORM/devices-typeORM-repository"

export class DeleteDeviceCommand {
    constructor(
        public readonly deviceId: string,
        public readonly userId: string,
    ) { }
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase implements ICommandHandler<DeleteDeviceCommand> {
    constructor(
        private readonly deviceRepository: DevicesTypeORMRepository
    ) { }

    async execute(command: DeleteDeviceCommand): Promise<void> {
        const {
            deviceId,
            userId,
        } = command

        const deletingDevice = await this.deviceRepository.getDeviceById(deviceId)

        if (userId !== deletingDevice.userInfo.userId) {
            throw new ForbiddenException(generateErrorsMessages('That is not your own', 'userId'))
        }

        await this.deviceRepository.deleteDeviceById(deviceId)
    }
}
