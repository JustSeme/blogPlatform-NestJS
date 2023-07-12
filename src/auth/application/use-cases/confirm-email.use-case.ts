import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { AuthTypeORMRepository } from "../../infrastructure/typeORM/auth-typeORM-repository"
import { UserEmailConfirmation } from "../../../SuperAdmin/domain/typeORM/user-email-confirmation.entity"
import { AuthQueryTypeORMRepository } from "../../infrastructure/typeORM/auth-query-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"

export class ConfirmEmailCommand {
    constructor(public readonly code: string) { }
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand> {
    constructor(
        private authRepository: AuthTypeORMRepository,
        private authQueryRepository: AuthQueryTypeORMRepository,
        @InjectDataSource() private dataSource: DataSource,
    ) { }

    async execute(command: ConfirmEmailCommand) {
        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()

        let savedUserEmailConfirmtaionData, savedUser

        try {
            const userEmailConfirmationData = await this.authQueryRepository.findUserEmailConfirmationDataByCode(command.code)

            if (!this.isUserCanBeConfirmed(userEmailConfirmationData, command.code)) {
                return false
            }

            userEmailConfirmationData.isEmailConfirmed = true

            savedUserEmailConfirmtaionData = await this.authRepository.queryRunnerSave(userEmailConfirmationData, queryRunner.manager)

            const user = await this.authQueryRepository.findUserData(userEmailConfirmationData.user.id)

            user.isConfirmed = true

            savedUser = await this.authRepository.queryRunnerSave(user, queryRunner.manager)

            await queryRunner.commitTransaction()
        } catch (err) {
            console.error(err)

            await queryRunner.rollbackTransaction()

            return false
        } finally {
            await queryRunner.release()
        }


        return savedUserEmailConfirmtaionData && savedUser
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