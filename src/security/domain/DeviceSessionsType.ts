import { Model } from "mongoose"
import { DeviceAuthSession } from "./DeviceAuthSessionsSchema"

export class DeviceAuthSessionModel {
    public userInfo: UserInfoType
    public deviceInfo: DeviceInfoType

    constructor(
        public issuedAt: number,
        public expireDate: number,
        userId: string,
        userIp: string,
        deviceId: string,
        deviceName: string,
    ) {

        this.userInfo = {
            userId,
            userIp
        }
        this.deviceInfo = {
            deviceId,
            deviceName
        }
    }
}

export type UserInfoType = {
    userId: string
    userIp: string
}

export type DeviceInfoType = {
    deviceId: string
    deviceName: string
}

export type DeviceAuthSessionModelType = Model<DeviceAuthSession>