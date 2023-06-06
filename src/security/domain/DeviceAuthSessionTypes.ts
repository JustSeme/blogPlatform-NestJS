import { Model } from "mongoose"
import { DeviceAuthSession } from "./DeviceAuthSessionSchema"

export class DeviceAuthSessionDBModel {
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

export class DeviceAuthSessionSQLModel {
    public deviceId: string
    public deviceName: string
    public userId: string
    public userIp: string
    public issuedAt: number
    public expireDate: number
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