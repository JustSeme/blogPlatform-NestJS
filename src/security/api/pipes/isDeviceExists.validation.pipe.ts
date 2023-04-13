import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "src/helpers"
import { DeviceRepository } from "src/security/infrastructure/device-db-repository"

@Injectable()
export class IsDeviceExistsPipe implements PipeTransform {
    constructor(private devicesRepository: DeviceRepository) { }

    async transform(deviceId: string): Promise<string> {
        if (!(await this.devicesRepository.isDeviceExists(deviceId))) {
            throw new NotFoundException(generateErrorsMessages('Device by deviceId paramether is not found', 'deviceId'))
        }
        return deviceId
    }

}