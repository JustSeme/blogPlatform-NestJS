import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { EmailManager } from "../../../general/managers/emailManager"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { FieldError } from "../../../general/types/ErrorMessagesOutputModel"
import { BadRequestException } from '@nestjs/common'
import { AuthRepository } from "../../infrastructure/auth-sql-repository"
import { UsersTypeORMRepository } from "../../../SuperAdmin/infrastructure/typeORM/users-typeORM-repository"
import { UserPasswordRecovery } from "../../../SuperAdmin/domain/typeORM/user-password-recovery.entity"
import { UserEmailConfirmation } from "../../../SuperAdmin/domain/typeORM/user-email-confirmation.entity"
import { UserBanInfo } from "../../../SuperAdmin/domain/typeORM/user-ban-info.entity"
import { UserEntity } from "../../../SuperAdmin/domain/typeORM/user.entity"
import { v4 as uuidv4 } from 'uuid'
import { InjectDataSource } from "@nestjs/typeorm"
import { add } from 'date-fns'
import { DataSource } from "typeorm"

export class RegistrationUserCommand {
    constructor(public login: string, public password: string, public email: string) { }
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase implements ICommandHandler<RegistrationUserCommand> {
    constructor(
        private bcryptAdapter: BcryptAdapter,
        private authRepository: AuthRepository,
        private usersRepository: UsersTypeORMRepository,
        private emailManager: EmailManager,
        @InjectDataSource() private dataSource: DataSource
    ) { }

    async execute(command: RegistrationUserCommand): Promise<boolean> {
        // if already used - throw bad request exception 
        await this.isEmailOrLoginAlreadyUsed(command.login, command.email)

        const passwordHash = await this.bcryptAdapter.generatePasswordHash(command.password, 10)

        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()

        try {
            const queryRunnerManager = queryRunner.manager

            const userEntityData = new UserEntity()
            userEntityData.login = command.login
            userEntityData.email = command.email
            userEntityData.passwordHash = passwordHash
            userEntityData.isConfirmed = true

            await this.usersRepository.queryRunnerSave(userEntityData, queryRunnerManager)

            const userBanInfoData = new UserBanInfo()
            userBanInfoData.userId = userEntityData

            await this.usersRepository.queryRunnerSave(userBanInfoData, queryRunnerManager)

            const userEmailConfirmationData = new UserEmailConfirmation()
            userEmailConfirmationData.emailConfirmationCode = uuidv4()
            userEmailConfirmationData.emailExpirationDate = add(new Date(), {
                hours: 1,
                minutes: 3
            })
            userEmailConfirmationData.user = userEntityData

            await this.usersRepository.queryRunnerSave(userEmailConfirmationData, queryRunnerManager)

            const userPasswordRecoveryData = new UserPasswordRecovery()
            userPasswordRecoveryData.user = userEntityData

            await this.usersRepository.queryRunnerSave(userPasswordRecoveryData, queryRunnerManager)

            await this.emailManager.sendConfirmationCode(command.email, command.login, userEmailConfirmationData.emailConfirmationCode)

            await queryRunner.commitTransaction()
            return true
        } catch (err) {
            console.error(err)

            await queryRunner.rollbackTransaction()

            return null
        } finally {
            await queryRunner.release()
        }
    }

    async isEmailOrLoginAlreadyUsed(login: string, email: string) {
        const isUserByLoginExists = await this.authRepository.isUserByLoginExists(login)
        const isUserByEmailExists = await this.authRepository.isUserByEmailExists(email)

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