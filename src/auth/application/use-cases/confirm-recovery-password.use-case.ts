import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import {
    CommandHandler,
    ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { generateErrorsMessages } from "../../../general/helpers"
import { BadRequestException } from '@nestjs/common'
import { AuthTypeORMRepository } from "../../infrastructure/auth-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"

export class ConfirmRecoveryPasswordCommand implements ICommand {
    constructor(public readonly recoveryCode: string, public readonly newPassword: string) { }
}

@CommandHandler(ConfirmRecoveryPasswordCommand)
export class ConfirmRecoveryPasswordUseCase implements ICommandHandler<ConfirmRecoveryPasswordCommand> {
    constructor(
        private bcryptAdapter: BcryptAdapter,
        private authRepository: AuthTypeORMRepository,
        @InjectDataSource() private dataSource: DataSource,
    ) {
    }

    async execute(command: ConfirmRecoveryPasswordCommand) {
        const {
            newPassword,
            recoveryCode
        } = command

        const queryRunner = this.dataSource.createQueryRunner()


        try {
            const userPasswordRecoveryData = await this.authRepository.findUserPasswordRecoveryData(recoveryCode)

            if (!userPasswordRecoveryData || userPasswordRecoveryData.passwordRecoveryExpirationDate < new Date()) {
                throw new BadRequestException(generateErrorsMessages('recoveryCode is incorrect', 'recoveryCode'))
            }

            userPasswordRecoveryData.passwordRecoveryConfirmationCode = null
            userPasswordRecoveryData.passwordRecoveryExpirationDate = null

            const savedPasswordRecoveryData = await this.authRepository.queryRunnerSave(userPasswordRecoveryData, queryRunner.manager)

            const newPasswordHash = await this.bcryptAdapter.generatePasswordHash(newPassword, 10)

            const userData = await this.authRepository.findUserData(String(userPasswordRecoveryData.user))

            userData.passwordHash = newPasswordHash

            const savedUserData = await this.authRepository.queryRunnerSave(userData, queryRunner.manager)

            await queryRunner.commitTransaction()

            return savedPasswordRecoveryData && savedUserData
        } catch (err) {
            console.error(err)

            await queryRunner.rollbackTransaction()

            return false
        } finally {
            await queryRunner.release()
        }
    }
}