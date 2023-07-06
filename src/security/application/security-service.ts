import { DeviceSessionsViewModel } from "./dto/DeviceSessionsViewModel"
import { Injectable } from "@nestjs/common/decorators"
import { DeviceAuthSessionDBModel } from "../domain/DeviceAuthSessionTypes"
import { DevicesSQLRepository } from "../infrastructure/rawSQL/devices-sql-repository"

@Injectable()
export class SecurityService {
    constructor(protected deviceRepository: DevicesSQLRepository) { }

    prepareDevicesForDisplay(devices: DeviceAuthSessionDBModel[]): DeviceSessionsViewModel[] {
        return devices.map(el => ({
            ip: el.userInfo.userIp,
            title: el.deviceInfo.deviceName,
            lastActiveDate: new Date(el.issuedAt * 1000),
            deviceId: el.deviceInfo.deviceId,
        }))
    }
}