import { DeviceSessionsViewModel } from "./dto/DeviceSessionsViewModel"
import { DeviceRepository } from "../infrastructure/device-db-repository"
import { Injectable } from "@nestjs/common/decorators"
import { DeviceAuthSessionDBModel } from "../domain/DeviceAuthSessionTypes"

@Injectable()
export class SecurityService {
    constructor(protected deviceRepository: DeviceRepository) { }

    prepareDevicesForDisplay(devices: DeviceAuthSessionDBModel[]): DeviceSessionsViewModel[] {
        return devices.map(el => ({
            ip: el.userInfo.userIp,
            title: el.deviceInfo.deviceName,
            lastActiveDate: new Date(el.issuedAt * 1000),
            deviceId: el.deviceInfo.deviceId,
        }))
    }
}