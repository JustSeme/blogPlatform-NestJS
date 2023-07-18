import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { EmailManager } from "../../../general/managers/emailManager"
import { CommandHandler } from "@nestjs/cqrs"
import { FieldError } from "../../../general/types/ErrorMessagesOutputModel"
import { BadRequestException } from '@nestjs/common'
import { UsersTypeORMRepository } from "../../../SuperAdmin/infrastructure/typeORM/users-typeORM-repository"
import { UserPasswordRecovery } from "../../../SuperAdmin/domain/typeORM/user-password-recovery.entity"
import { UserEmailConfirmation } from "../../../SuperAdmin/domain/typeORM/user-email-confirmation.entity"
import { UserBanInfo } from "../../../SuperAdmin/domain/typeORM/user-ban-info.entity"
import { UserEntity } from "../../../SuperAdmin/domain/typeORM/user.entity"
import { v4 as uuidv4 } from 'uuid'
import { InjectDataSource } from "@nestjs/typeorm"
import { add } from 'date-fns'
import {
    DataSource, EntityManager
} from "typeorm"
import { AuthQueryTypeORMRepository } from "../../infrastructure/typeORM/auth-query-typeORM-repository"
import { TransactionBaseUseCase } from "../../../general/use-cases/transaction-base.use-case"

export class RegistrationUserCommand {
    constructor(public login: string, public password: string, public email: string) { }
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase extends TransactionBaseUseCase<RegistrationUserCommand, boolean> {
    constructor(
        protected bcryptAdapter: BcryptAdapter,
        protected usersRepository: UsersTypeORMRepository,
        protected emailManager: EmailManager,
        protected authQueryRepository: AuthQueryTypeORMRepository,
        @InjectDataSource() protected dataSource: DataSource
    ) {
        super(dataSource)
    }

    async doLogic(input: RegistrationUserCommand, manager: EntityManager) {
        // if already used - throw bad request exception 
        await this.isEmailOrLoginAlreadyUsed(input.login, input.email)

        const passwordHash = await this.bcryptAdapter.generatePasswordHash(input.password, 10)

        const userEntityData = new UserEntity()
        userEntityData.login = input.login
        userEntityData.email = input.email
        userEntityData.passwordHash = passwordHash
        userEntityData.isConfirmed = false

        await this.usersRepository.queryRunnerSave(userEntityData, manager)

        const userBanInfoData = new UserBanInfo()
        userBanInfoData.userId = userEntityData

        await this.usersRepository.queryRunnerSave(userBanInfoData, manager)

        const userEmailConfirmationData = new UserEmailConfirmation()
        userEmailConfirmationData.emailConfirmationCode = uuidv4()
        userEmailConfirmationData.emailExpirationDate = add(new Date(), {
            hours: 1,
            minutes: 3
        })
        userEmailConfirmationData.user = userEntityData

        await this.usersRepository.queryRunnerSave(userEmailConfirmationData, manager)

        const userPasswordRecoveryData = new UserPasswordRecovery()
        userPasswordRecoveryData.user = userEntityData

        await this.usersRepository.queryRunnerSave(userPasswordRecoveryData, manager)

        await this.sendConfirmationCode(
            input.email,
            input.login,
            userEmailConfirmationData.emailConfirmationCode,
            userEntityData.id
        )

        return true
    }

    async execute(command: RegistrationUserCommand): Promise<boolean> {
        return super.execute(command)
    }

    async sendConfirmationCode(email: string, login: string, emailConfirmationCode: string, userId: string) {
        try {
            await this.emailManager.sendConfirmationCode(email, login, emailConfirmationCode)
        } catch (err) {
            console.error(err)
            await this.usersRepository.deleteUser(userId)
            return null
        }
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