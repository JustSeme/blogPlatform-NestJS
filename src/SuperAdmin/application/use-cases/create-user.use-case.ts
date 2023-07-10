import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { AuthRepository } from "../../../auth/infrastructure/rawSQL/auth-sql-repository"
import { FieldError } from "../../../general/types/ErrorMessagesOutputModel"
import { BadRequestException } from "@nestjs/common"
import { UsersTypeORMRepository } from "../../infrastructure/typeORM/users-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { UserEntity } from "../../domain/typeORM/user.entity"
import { UserBanInfo } from "../../domain/typeORM/user-ban-info.entity"
import { add } from 'date-fns'
import { UserEmailConfirmation } from "../../domain/typeORM/user-email-confirmation.entity"
import { v4 as uuidv4 } from 'uuid'
import { UserPasswordRecovery } from "../../domain/typeORM/user-password-recovery.entity"
import { AuthQueryTypeORMRepository } from "../../../auth/infrastructure/typeORM/auth-query-typeORM-repository"

export class CreateUserCommand {
    constructor(public login: string, public password: string, public email: string) { }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
    constructor(
        private bcryptAdapter: BcryptAdapter,
        private usersRepository: UsersTypeORMRepository,
        private authRepository: AuthRepository,
        private authQueryRepository: AuthQueryTypeORMRepository,
        @InjectDataSource() private dataSource: DataSource,
    ) { }

    async execute(command: CreateUserCommand): Promise<string | null> {
        // if login or email is already in use - throw 400 error
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

            const savedUser = await this.usersRepository.queryRunnerSave(userEntityData, queryRunnerManager)

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

            await queryRunner.commitTransaction()
            return savedUser.id
        } catch (err) {
            console.error(err)

            await queryRunner.rollbackTransaction()

            return null
        } finally {
            await queryRunner.release()
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