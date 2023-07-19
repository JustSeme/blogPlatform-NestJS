import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import { UserEntity } from "../../../SuperAdmin/domain/typeORM/user.entity"
import {
    DataSource, EntityManager, Repository
} from "typeorm"
import { UserPasswordRecovery } from "../../../SuperAdmin/domain/typeORM/users/user-password-recovery.entity"
import { UserEntitiesType } from "../../../SuperAdmin/infrastructure/UsersTypes"
import { UserEmailConfirmation } from "../../../SuperAdmin/domain/typeORM/users/user-email-confirmation.entity"

@Injectable()
export class AuthTypeORMRepository {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(UserPasswordRecovery)
        private userPasswordRecoveryRepository: Repository<UserPasswordRecovery>,
        @InjectRepository(UserEmailConfirmation)
        private userEmailConfirmationRepository: Repository<UserEmailConfirmation>,
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
}