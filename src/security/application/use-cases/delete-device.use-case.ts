import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { DeviceRepository } from "../../infrastructure/device-db-repository"
import { ForbiddenException } from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"

export class DeleteDeviceCommand {
    constructor(
        public readonly deviceId: string,
        public readonly userId: string,
    ) { }
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase implements ICommandHandler<DeleteDeviceCommand> {
    constructor(
        private readonly deviceRepository: DeviceRepository
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

        await deletingDevice.deleteOne()
    }
}
