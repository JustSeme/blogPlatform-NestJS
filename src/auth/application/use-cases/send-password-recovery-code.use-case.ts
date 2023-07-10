import { EmailManager } from "../../../general/managers/emailManager"
import { v4 as uuidv4 } from 'uuid'
import { add } from 'date-fns'
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { AuthQueryTypeORMRepository } from "../../infrastructure/typeORM/auth-query-typeORM-repository"
import { AuthTypeORMRepository } from "../../infrastructure/typeORM/auth-typeORM-repository"

export class SendPasswordRecoveryCodeCommand {
    constructor(public email: string) { }
}

@CommandHandler(SendPasswordRecoveryCodeCommand)
export class SendPasswordRecoveryCodeUseCase implements ICommandHandler<SendPasswordRecoveryCodeCommand> {
    constructor(
        private authRepository: AuthTypeORMRepository,
        private authQueryRepository: AuthQueryTypeORMRepository,
        private emailManager: EmailManager
    ) { }

    async execute(command: SendPasswordRecoveryCodeCommand) {
        const user = await this.authQueryRepository.findUserByEmail(command.email)
        if (!user) {
            return true
        }
        const passwordRecoveryCode = uuidv4()

        await this.emailManager.sendPasswordRecoveryCode(user.email, user.login, passwordRecoveryCode)

        const userPasswordRecoveryData = await this.authQueryRepository.findUserPasswordRecoveryDataByUserId(user.id)

        const expirationDate = add(new Date(), {
            hours: 1,
            minutes: 3
        })

        userPasswordRecoveryData.passwordRecoveryExpirationDate = expirationDate
        userPasswordRecoveryData.passwordRecoveryConfirmationCode = passwordRecoveryCode

        const savedPasswordRecoveryData = await this.authRepository.dataSourceSave(userPasswordRecoveryData)

        return savedPasswordRecoveryData ? true : false
    }
}