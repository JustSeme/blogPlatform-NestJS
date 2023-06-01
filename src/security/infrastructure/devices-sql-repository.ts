import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { DeviceAuthSessionDBModel } from "../domain/DeviceAuthSessionType"

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
}