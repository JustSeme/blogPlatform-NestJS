import { CommandHandler } from "@nestjs/cqrs"
import { AuthTypeORMRepository } from "../../infrastructure/typeORM/auth-typeORM-repository"
import { UserEmailConfirmation } from "../../../SuperAdmin/domain/typeORM/user-email-confirmation.entity"
import { AuthQueryTypeORMRepository } from "../../infrastructure/typeORM/auth-query-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import {
    DataSource, EntityManager
} from "typeorm"
import { TransactionBaseUseCase } from "../../../general/use-cases/transaction-base.use-case"

export class ConfirmEmailCommand {
    constructor(public readonly code: string) { }
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase extends TransactionBaseUseCase<ConfirmEmailCommand, boolean> {
    constructor(
        protected authRepository: AuthTypeORMRepository,
        protected authQueryRepository: AuthQueryTypeORMRepository,
        @InjectDataSource() protected dataSource: DataSource,
    ) {
        super(dataSource)
    }

    async doLogic(input: ConfirmEmailCommand, manager: EntityManager): Promise<boolean> {
        const userEmailConfirmationData = await this.authQueryRepository.findUserEmailConfirmationDataByCode(input.code)

        if (!this.isUserCanBeConfirmed(userEmailConfirmationData, input.code)) {
            return false
        }

        userEmailConfirmationData.isEmailConfirmed = true

        const savedUserEmailConfirmtaionData = await this.authRepository.queryRunnerSave(userEmailConfirmationData, manager)

        const user = await this.authQueryRepository.findUserData(userEmailConfirmationData.user.id)

        user.isConfirmed = true

        const savedUser = await this.authRepository.queryRunnerSave(user, manager)

        return (savedUserEmailConfirmtaionData && savedUser) ? true : false
    }

    async execute(command: ConfirmEmailCommand): Promise<boolean> {
        return super.execute(command)
    }

    isUserCanBeConfirmed(emailConfirmation: UserEmailConfirmation, recievedConfirmationCode: string) {
        if (!emailConfirmation) return false
        if (emailConfirmation.isEmailConfirmed) return false
        if (emailConfirmation.emailConfirmationCode !== recievedConfirmationCode) return false
        if (emailConfirmation.emailExpirationDate < new Date()) {
            return false
        }

        return true
    }
}