import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import { AuthSession } from "../../domain/typeORM/auth-session.entity"
import {
    DataSource,
    EntityManager, Repository
} from "typeorm"
import { DeviceAuthSessionDBModel } from "../../domain/DeviceAuthSessionTypes"

@Injectable()
export class DevicesTypeORMRepository {
    constructor(
        @InjectRepository(AuthSession)
        private authSessionsRepository: Repository<AuthSession>,
        @InjectDataSource() private dataSource: DataSource,
    ) { }

    async queryRunnerSave(
        entity: AuthSession,
        queryRunnerManager: EntityManager
    ): Promise<AuthSession> {
        try {
            return queryRunnerManager.save(entity)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async dataSourceSave(
        entity: AuthSession
    ): Promise<AuthSession> {
        try {
            return this.dataSource.manager.save(entity)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async removeSession(deviceId: string): Promise<boolean> {
        try {
            const isDeleted = await this.authSessionsRepository.delete({ deviceId })

            return isDeleted ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async deleteAllSessionsExcludeCurrent(userId: string, deviceId: string): Promise<boolean> {
        try {
            const isDeleted = await this.authSessionsRepository
                .createQueryBuilder('as')
                .where('user = :userId', { userId })
                .andWhere('deviceId <> :deviceId', { deviceId })
                .delete()
                .execute()

            return isDeleted ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async getDeviceData(deviceId: string): Promise<AuthSession> {
        try {
            const deviceById = await this.authSessionsRepository.findOne({ where: { deviceId } })

            return deviceById ? deviceById : null
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async getDeviceById(deviceId: string): Promise<DeviceAuthSessionDBModel> {
        try {
            const deviceById = await this.authSessionsRepository.findOne({
                where: { deviceId },
                relations: { user: true }
            })

            if (!deviceById) {
                return null
            }

            return new DeviceAuthSessionDBModel(deviceById.issuedAt,
                deviceById.expireDate,
                deviceById.user.id,
                deviceById.userIp,
                deviceById.deviceId,
                deviceById.deviceName)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async deleteDeviceById(deviceId: string): Promise<boolean> {
        try {
            const isDeleted = await this.authSessionsRepository.delete({ deviceId })

            return isDeleted ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async getCurrentIssuedAt(deviceId: string): Promise<number> {
        const result = await this.getDeviceById(deviceId)
        return result.issuedAt
    }

    async isDeviceExists(deviceId: string): Promise<boolean> {
        const device = await this.getDeviceById(deviceId)
        return device ? true : false
    }

    async getDevicesForUser(userId: string): Promise<DeviceAuthSessionDBModel[]> {
        try {
            const devicesData = await this.authSessionsRepository.find({ where: { user: { id: userId } } })

            return devicesData.map((device) => new DeviceAuthSessionDBModel(
                device.issuedAt,
                device.expireDate,
                String(device.user),
                device.userIp,
                device.deviceId,
                device.deviceName))
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async deleteAllSessions(userId: string): Promise<boolean> {
        try {
            const isDeleted = await this.authSessionsRepository
                .createQueryBuilder('as')
                .where('user = :userId', { userId })
                .delete()
                .execute()

            return isDeleted ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }
}   