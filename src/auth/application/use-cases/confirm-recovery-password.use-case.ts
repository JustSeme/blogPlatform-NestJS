import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import {
    CommandHandler,
    ICommand, ICommandHandler
} from "@nestjs/cqrs"
import { AuthTypeORMRepository } from "../../infrastructure/typeORM/auth-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { AuthQueryTypeORMRepository } from "../../infrastructure/typeORM/auth-query-typeORM-repository"

export class ConfirmRecoveryPasswordCommand implements ICommand {
    constructor(public readonly recoveryCode: string, public readonly newPassword: string) { }
}

@CommandHandler(ConfirmRecoveryPasswordCommand)
export class ConfirmRecoveryPasswordUseCase implements ICommandHandler<ConfirmRecoveryPasswordCommand> {
    constructor(
        private bcryptAdapter: BcryptAdapter,
        private authRepository: AuthTypeORMRepository,
        private authQueryRepository: AuthQueryTypeORMRepository,
        @InjectDataSource() private dataSource: DataSource,
    ) {
    }

    async execute(command: ConfirmRecoveryPasswordCommand) {
        const {
            newPassword,
            recoveryCode
        } = command

        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()

        try {
            const userPasswordRecoveryData = await this.authQueryRepository.findUserPasswordRecoveryDataByRecoveryCode(recoveryCode)

            if (!userPasswordRecoveryData || userPasswordRecoveryData.passwordRecoveryExpirationDate < new Date()) {
                return false
            }

            userPasswordRecoveryData.passwordRecoveryConfirmationCode = null
            userPasswordRecoveryData.passwordRecoveryExpirationDate = null

            const savedPasswordRecoveryData = await this.authRepository.queryRunnerSave(userPasswordRecoveryData, queryRunner.manager)

            const newPasswordHash = await this.bcryptAdapter.generatePasswordHash(newPassword, 10)

            const userData = await this.authQueryRepository.findUserData(userPasswordRecoveryData.user.id)

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