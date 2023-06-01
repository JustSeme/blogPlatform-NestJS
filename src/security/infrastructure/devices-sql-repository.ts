import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import {
    DeviceAuthSessionDBModel, DeviceAuthSessionSQLModel
} from "../domain/DeviceAuthSessionTypes"

@Injectable()
export class DevicesSQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async addSession(newSession: DeviceAuthSessionDBModel): Promise<boolean> {
        const queryString = `
            INSERT INTO public."AuthSessions"
                ("deviceId", "deviceName", "userId", "userIp", "issuedAt", "expireDate")
                VALUES ($1, $2, $3, $4, $5, $6);
        `

        try {
            await this.dataSource.query(queryString, [
                newSession.deviceInfo.deviceId,
                newSession.deviceInfo.deviceName,
                newSession.userInfo.userId,
                newSession.userInfo.userIp,
                newSession.issuedAt,
                newSession.expireDate
            ])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async removeSession(deviceId: string): Promise<boolean> {
        const queryString = `
            DELETE FROM public."AuthSessions"
                WHERE "deviceId" = $1;
        `

        try {
            await this.dataSource.query(queryString, [deviceId])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async deleteAllSessionsExcludeCurrent(userId: string, deviceId: string): Promise<boolean> {
        const queryString = `
            DELETE FROM public."AuthSessions"
                WHERE "userId" = $1 AND "deviceId" <> $2;
        `

        try {
            await this.dataSource.query(queryString, [userId, deviceId])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async updateSession(deviceId: string, issuedAt: number, expireDate: number): Promise<boolean> {
        const queryString = `
            UPDATE public."AuthSessions"
                SET "issuedAt"=$2, "expireDate"=$3
                WHERE "deviceId" = $1;
        `

        try {
            await this.dataSource.query(queryString, [deviceId, issuedAt, expireDate])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async getDeviceById(deviceId: string): Promise<DeviceAuthSessionDBModel> {
        const queryString = `
            SELECT *
                FROM public."AuthSessions"
                WHERE "deviceId" = $1
        `

        const findedDeviceData: DeviceAuthSessionSQLModel[] = await this.dataSource.query(queryString, [deviceId])

        return new DeviceAuthSessionDBModel(
            findedDeviceData[0].issuedAt,
            findedDeviceData[0].expireDate,
            findedDeviceData[0].userId,
            findedDeviceData[0].userIp,
            findedDeviceData[0].deviceId,
            findedDeviceData[0].deviceName)
    }

    async getCurrentIssuedAt(deviceId: string): Promise<number> {
        const result = await this.getDeviceById(deviceId)
        return result.issuedAt
    }

    async deleteDeviceById(deviceId: string): Promise<boolean> {
        const queryString = `
            DELETE FROM public."AuthSessions"
                WHERE "deviceId" = $1;
        `

        try {
            await this.dataSource.query(queryString, [deviceId])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async isDeviceExists(deviceId: string): Promise<boolean> {
        const device = this.getDeviceById(deviceId)
        return device ? true : false
    }

    async getDevicesForUser(userId: string): Promise<DeviceAuthSessionDBModel[]> {
        const queryString = `
            SELECT *
                FROM public."AuthSessions"
                WHERE "userId" = $1
        `

        const findedDevicesData: DeviceAuthSessionSQLModel[] = await this.dataSource.query(queryString, [userId])

        return findedDevicesData.map((device) => new DeviceAuthSessionDBModel(
            device.issuedAt,
            device.expireDate,
            device.userId,
            device.userIp,
            device.deviceId,
            device.deviceName))
    }

    async deleteAllSessions(userId: string): Promise<boolean> {
        const queryString = `
            DELETE FROM public."AuthSessions"
                WHERE "userId" = $1;
        `

        try {
            await this.dataSource.query(queryString, [userId])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}