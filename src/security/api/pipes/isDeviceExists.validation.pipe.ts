import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { DevicesSQLRepository } from "../../infrastructure/rawSQL/devices-sql-repository"

@Injectable()
export class IsDeviceExistsPipe implements PipeTransform {
    constructor(private devicesRepository: DevicesSQLRepository) { }

    async transform(deviceId: string): Promise<string> {
        if (!(await this.devicesRepository.isDeviceExists(deviceId))) {
            throw new NotFoundException(generateErrorsMessages('Device by deviceId paramether is not found', 'deviceId'))
        }
        return deviceId
    }

}