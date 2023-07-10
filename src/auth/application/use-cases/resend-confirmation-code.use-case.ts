import { v4 as uuidv4 } from 'uuid'
import { EmailManager } from "../../../general/managers/emailManager"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { add } from 'date-fns'
import { AuthTypeORMRepository } from '../../infrastructure/typeORM/auth-typeORM-repository'
import { AuthQueryTypeORMRepository } from '../../infrastructure/typeORM/auth-query-typeORM-repository'

export class ResendConfirmationCodeCommand {
    constructor(public email: string) { }
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeUseCase implements ICommandHandler<ResendConfirmationCodeCommand> {
    constructor(
        private authRepository: AuthTypeORMRepository,
        private authQueryRepository: AuthQueryTypeORMRepository,
        private emailManager: EmailManager
    ) { }

    async execute(command: ResendConfirmationCodeCommand) {
        const user = await this.authQueryRepository.findUserByEmail(command.email)
        if (!user || user.isConfirmed) return false

        const emailConfirmationData = await this.authQueryRepository.findUserEmailConfirmationDataByUserId(user.id)

        const newConfirmationCode = uuidv4()

        const expirationDate = add(new Date(), {
            hours: 1,
            minutes: 3
        })

        emailConfirmationData.emailConfirmationCode = newConfirmationCode
        emailConfirmationData.emailExpirationDate = expirationDate

        const savedEmailConfirmationData = await this.authRepository.dataSourceSave(emailConfirmationData)

        try {
            await this.emailManager.sendConfirmationCode(command.email, user.login, newConfirmationCode)
            return savedEmailConfirmationData ? true : false
        } catch (error) {
            console.error(error)
            return false
        }
    }
}