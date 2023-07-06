import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { DevicesTypeORMRepository } from "../../infrastructure/typeORM/devices-typeORM-repository"

@Injectable()
export class IsDeviceExistsPipe implements PipeTransform {
    constructor(private devicesRepository: DevicesTypeORMRepository) { }

    async transform(deviceId: string): Promise<string> {
        if (!(await this.devicesRepository.isDeviceExists(deviceId))) {
            throw new NotFoundException(generateErrorsMessages('Device by deviceId paramether is not found', 'deviceId'))
        }
        return deviceId
    }

}