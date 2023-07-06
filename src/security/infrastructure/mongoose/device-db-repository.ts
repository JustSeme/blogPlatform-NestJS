import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { DeviceAuthSession } from '../../domain/mongoose/DeviceAuthSessionSchema'
import {
    DeviceAuthSessionDBModel, DeviceAuthSessionModelType
} from '../../domain/DeviceAuthSessionTypes'

@Injectable()
export class DeviceRepository {
    constructor(@InjectModel(DeviceAuthSession.name) private DeviceAuthSessionModel: DeviceAuthSessionModelType) { }

    async addSession(newSession: DeviceAuthSessionDBModel) {
        const result = await this.DeviceAuthSessionModel.create(newSession)
        return result ? true : false
    }

    async removeSession(deviceId: string) {
        const result = await this.DeviceAuthSessionModel.deleteOne({ 'deviceInfo.deviceId': deviceId })
        return result.deletedCount === 1
    }

    async deleteAllSessionsExcludeCurrent(userId: string, deviceId: string) {
        const result = await this.DeviceAuthSessionModel.deleteMany({ $and: [{ 'userInfo.userId': userId }, { 'deviceInfo.deviceId': { $ne: deviceId } }] })
        return result.deletedCount > 0
    }

    async updateSession(deviceId: string, issuedAt: number, expireDate: number) {
        const result = await this.DeviceAuthSessionModel.updateOne({ "deviceInfo.deviceId": deviceId }, {
            issuedAt, expireDate
        })
        return result.matchedCount === 1
    }

    async getDevicesForUser(userId: string) {
        return this.DeviceAuthSessionModel.find({ "userInfo.userId": userId })
    }

    async getDeviceById(deviceId: string) {
        return this.DeviceAuthSessionModel.findOne({ 'deviceInfo.deviceId': deviceId })
    }

    async getCurrentIssuedAt(deviceId: string) {
        const result = await this.getDeviceById(deviceId)
        return result.issuedAt
    }

    async isDeviceExists(deviceId: string) {
        const deviceByDeviceId = await this.getDeviceById(deviceId)
        return deviceByDeviceId ? true : false
    }

    async deleteAllSessions(userId: string): Promise<boolean> {
        const result = await this.DeviceAuthSessionModel.deleteMany({ 'userInfo.userId': userId })
        return result.deletedCount > 0 ? true : false
    }
}