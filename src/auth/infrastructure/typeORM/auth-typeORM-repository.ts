import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import { UserEntity } from "../../../SuperAdmin/domain/typeORM/user.entity"
import {
    DataSource, EntityManager, Repository
} from "typeorm"
import { UserPasswordRecovery } from "../../../SuperAdmin/domain/typeORM/user-password-recovery.entity"
import { UserEntitiesType } from "../../../SuperAdmin/infrastructure/UsersTypes"

@Injectable()
export class AuthTypeORMRepository {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(UserPasswordRecovery)
        private userPasswordRecoveryRepository: Repository<UserPasswordRecovery>,
        @InjectDataSource() private dataSource: DataSource
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

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserEntity> {
        return this.usersRepository
            .createQueryBuilder('u')
            .where('u.login = :loginOrEmail', { loginOrEmail })
            .orWhere('u.email = :loginOrEmail', { loginOrEmail })
            .getOne()
    }

    async findUserPasswordRecoveryData(recoveryCode: string): Promise<UserPasswordRecovery> {
        try {
            const passwwordRecoveryData = await this.userPasswordRecoveryRepository
                .createQueryBuilder('upr')
                .where('upr.passwordRecoveryConfirmationCode = :recoveryCode', { recoveryCode })
                .getOne()

            return passwwordRecoveryData
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserData(userId: string): Promise<UserEntity> {
        try {
            return this.usersRepository.findOne({ where: { id: userId } })
        } catch (err) {
            console.error(err)
            return null
        }
    }
}