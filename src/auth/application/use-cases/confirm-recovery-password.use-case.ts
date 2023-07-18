import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import {
    CommandHandler,
    ICommand
} from "@nestjs/cqrs"
import { AuthTypeORMRepository } from "../../infrastructure/typeORM/auth-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import {
    DataSource, EntityManager
} from "typeorm"
import { AuthQueryTypeORMRepository } from "../../infrastructure/typeORM/auth-query-typeORM-repository"
import { TransactionBaseUseCase } from "../../../general/use-cases/transaction-base.use-case"

export class ConfirmRecoveryPasswordCommand implements ICommand {
    constructor(public readonly recoveryCode: string, public readonly newPassword: string) { }
}

@CommandHandler(ConfirmRecoveryPasswordCommand)
export class ConfirmRecoveryPasswordUseCase extends TransactionBaseUseCase<ConfirmRecoveryPasswordCommand, boolean> {
    constructor(
        protected bcryptAdapter: BcryptAdapter,
        protected authRepository: AuthTypeORMRepository,
        protected authQueryRepository: AuthQueryTypeORMRepository,
        @InjectDataSource() protected dataSource: DataSource,
    ) {
        super(dataSource)
    }

    async doLogic(input: ConfirmRecoveryPasswordCommand, manager: EntityManager): Promise<boolean> {
        const {
            newPassword,
            recoveryCode
        } = input

        const userPasswordRecoveryData = await this.authQueryRepository.findUserPasswordRecoveryDataByRecoveryCode(recoveryCode)

        if (!userPasswordRecoveryData || userPasswordRecoveryData.passwordRecoveryExpirationDate < new Date()) {
            return false
        }

        userPasswordRecoveryData.passwordRecoveryConfirmationCode = null
        userPasswordRecoveryData.passwordRecoveryExpirationDate = null

        const savedPasswordRecoveryData = await this.authRepository.queryRunnerSave(userPasswordRecoveryData, manager)

        const newPasswordHash = await this.bcryptAdapter.generatePasswordHash(newPassword, 10)

        const userData = await this.authQueryRepository.findUserData(userPasswordRecoveryData.user.id)

        userData.passwordHash = newPasswordHash

        const savedUserData = await this.authRepository.queryRunnerSave(userData, manager)

        return (savedPasswordRecoveryData && savedUserData) ? true : false
    }

    async execute(command: ConfirmRecoveryPasswordCommand) {
        return super.execute(command)
    }
}