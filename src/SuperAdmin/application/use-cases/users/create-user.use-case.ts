import { BcryptAdapter } from "../../../../general/adapters/bcrypt.adapter"
import { CommandHandler } from "@nestjs/cqrs/dist"
import { FieldError } from "../../../../general/types/ErrorMessagesOutputModel"
import { BadRequestException } from "@nestjs/common"
import { UsersTypeORMRepository } from "../../../infrastructure/typeORM/users-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import {
    DataSource, EntityManager
} from "typeorm"
import { UserEntity } from "../../../domain/typeORM/user.entity"
import { UserBanInfo } from "../../../domain/typeORM/users/user-ban-info.entity"
import { UserEmailConfirmation } from "../../../domain/typeORM/users/user-email-confirmation.entity"
import { UserPasswordRecovery } from "../../../domain/typeORM/users/user-password-recovery.entity"
import { AuthQueryTypeORMRepository } from "../../../../auth/infrastructure/typeORM/auth-query-typeORM-repository"
import { TransactionBaseUseCase } from "../../../../general/use-cases/transaction-base.use-case"

export class CreateUserCommand {
    constructor(public login: string, public password: string, public email: string) { }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase extends TransactionBaseUseCase<CreateUserCommand, string> {
    constructor(
        protected bcryptAdapter: BcryptAdapter,
        protected usersRepository: UsersTypeORMRepository,
        protected authQueryRepository: AuthQueryTypeORMRepository,
        @InjectDataSource() protected dataSource: DataSource,
    ) {
        super(dataSource)
    }

    async doLogic(input: CreateUserCommand, manager: EntityManager): Promise<string> {
        // if login or email is already in use - throw 400 error
        await this.isEmailOrLoginAlreadyUsed(input.login, input.email)

        const passwordHash = await this.bcryptAdapter.generatePasswordHash(input.password, 10)

        const userEntityData = new UserEntity()
        userEntityData.login = input.login
        userEntityData.email = input.email
        userEntityData.passwordHash = passwordHash
        userEntityData.isConfirmed = true

        const savedUser = await this.usersRepository.queryRunnerSave(userEntityData, manager)

        const userBanInfoData = new UserBanInfo()
        userBanInfoData.userId = userEntityData

        await this.usersRepository.queryRunnerSave(userBanInfoData, manager)

        const userEmailConfirmationData = new UserEmailConfirmation()
        userEmailConfirmationData.emailConfirmationCode = null
        userEmailConfirmationData.emailExpirationDate = null
        userEmailConfirmationData.user = savedUser as UserEntity

        await this.usersRepository.queryRunnerSave(userEmailConfirmationData, manager)

        const userPasswordRecoveryData = new UserPasswordRecovery()
        userPasswordRecoveryData.user = savedUser as UserEntity

        await this.usersRepository.queryRunnerSave(userPasswordRecoveryData, manager)

        return savedUser.id
    }

    async execute(command: CreateUserCommand): Promise<string | null> {
        return super.execute(command)
    }

    async isEmailOrLoginAlreadyUsed(login: string, email: string) {
        const isUserByLoginExists = await this.authQueryRepository.isUserByLoginExists(login)
        const isUserByEmailExists = await this.authQueryRepository.isUserByEmailExists(email)

        if (isUserByLoginExists || isUserByEmailExists) {
            const errorsMessages: FieldError[] = []

            if (isUserByLoginExists) {
                errorsMessages.push({
                    message: 'Login is already exist',
                    field: 'login'
                })
            }

            if (isUserByEmailExists) {
                errorsMessages.push({
                    message: 'Email is already exist',
                    field: 'email'
                })
            }

            throw new BadRequestException(errorsMessages)
        }
    }
}