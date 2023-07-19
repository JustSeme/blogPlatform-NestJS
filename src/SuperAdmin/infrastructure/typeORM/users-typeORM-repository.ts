import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import { UserEntity } from "../../domain/typeORM/user.entity"
import {
    DataSource, EntityManager, Repository
} from "typeorm"
import { UserBanInfo } from "../../domain/typeORM/users/user-ban-info.entity"
import { UserEntitiesType } from "../UsersTypes"
import { UserPasswordRecovery } from "../../domain/typeORM/users/user-password-recovery.entity"
import { UserEmailConfirmation } from "../../domain/typeORM/users/user-email-confirmation.entity"
import { BanUserInputModel } from "../../api/models/users/BanUserInputModel"

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
            const userData = await this.usersRepository.findOneBy({ id: userId })

            return userData
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserDataWithPasswordRecovery(userId: string): Promise<UserEntity & UserPasswordRecovery> {
        try {
            const findedUserData = await this.usersRepository.findOne({
                where: { id: userId },
                relations: { passwordRecovery: true }
            })

            return { ...findedUserData as UserEntity & UserPasswordRecovery }
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserDataWithEmailConfirmation(userId: string): Promise<UserEntity & UserEmailConfirmation> {
        try {
            const findedUserData = await this.usersRepository.findOne({
                where: { id: userId },
                relations: { emailConfirmation: true }
            })

            return { ...findedUserData as UserEntity & UserEmailConfirmation }
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async deleteUser(userId: string): Promise<boolean> {
        try {
            await this.usersRepository.delete({ id: userId })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async updateBanForUser(userId: string, banInputModel: BanUserInputModel): Promise<boolean> {
        try {
            await this.usersBanInfoRepository.update({ userId }, {
                isBanned: banInputModel.isBanned,
                banDate: banInputModel.isBanned ? new Date() : null,
                banReason: banInputModel.isBanned ? banInputModel.banReason : null
            })
            await this.usersRepository.update({ id: userId }, { isBanned: banInputModel.isBanned })
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}