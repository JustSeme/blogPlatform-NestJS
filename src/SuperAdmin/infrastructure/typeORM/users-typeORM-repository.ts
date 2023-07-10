import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import { UserEntity } from "../../domain/typeORM/user.entity"
import {
    DataSource, EntityManager, Repository
} from "typeorm"
import { UserBanInfo } from "../../domain/typeORM/user-ban-info.entity"
import { UserEntitiesType } from "../UsersTypes"

@Injectable()
export class UsersTypeORMRepository {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(UserBanInfo)
        private usersBanInfoRepository: Repository<UserBanInfo>,
        @InjectDataSource() private dataSource: DataSource,
    ) { }

    async queryRunnerSave(
        entity: UserEntitiesType,
        queryRunnerManager: EntityManager
    ): Promise<UserEntitiesType> {
        try {
            return queryRunnerManager.save(entity)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async dataSourceSave(
        entity: UserEntitiesType
    ): Promise<UserEntitiesType> {
        try {
            return this.dataSource.manager.save(entity)
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserData(userId: string): Promise<UserEntity> {
        try {
            return this.usersRepository.findOneBy({ id: userId })
        } catch (err) {
            console.error(err)
            return null
        }
    }

    /* async findUserDataWithPasswordRecovery(userId: string): Promise<UserEntity & UserPasswordRecovery> {
        try {
            const findedUserData = await this.findUserData(userId)
            const findedPasswordRecoveryData = await this.usersPasswordRecoveriesRepository.findOneBy({ userId })

            return {
                ...findedUserData, ...findedPasswordRecoveryData
            }
        } catch (err) {
            console.error(err)
            return null
        }

    }

    async findUserDataWithEmailConfirmation(userId: string): Promise<UserEntity & UserEmailConfirmation> {
        try {
            const findedUserData = await this.findUserData(userId)
            const findedEmailConfirmationData = await this.usersEmailConfirmationsRepository.findOneBy({ userId })

            return {
                ...findedUserData, ...findedEmailConfirmationData
            }
        } catch (err) {
            console.error(err)
            return null
        }
    } */

    async deleteUser(userId: string): Promise<boolean> {
        try {
            await this.usersRepository.delete({ id: userId })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async banUserById(userId: string, banReason: string): Promise<boolean> {
        try {
            await this.usersBanInfoRepository.update({ userId }, {
                isBanned: true,
                banDate: new Date(),
                banReason: banReason
            })
            await this.usersRepository.update({ id: userId }, { isBanned: true })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async unbanUserById(userId: string): Promise<boolean> {
        try {
            await this.usersBanInfoRepository.update({ userId }, {
                isBanned: false,
                banDate: null,
                banReason: null
            })
            await this.usersRepository.update({ id: userId }, { isBanned: false })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}