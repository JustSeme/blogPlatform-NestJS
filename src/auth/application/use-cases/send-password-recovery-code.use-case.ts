import { Injectable } from "@nestjs/common"
import { EmailManager } from "../../../general/managers/emailManager"
import { UsersRepository } from "../../infrastructure/users-db-repository"
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class SendPasswordRecoveryCode {
    constructor(
        private usersRepository: UsersRepository,
        private emailManager: EmailManager
    ) { }

    async execute(email: string) {
        const user = await this.usersRepository.findUserByEmail(email)
        if (!user) {
            return true
        }
        const passwordRecoveryCode = uuidv4()

        await this.emailManager.sendPasswordRecoveryCode(user.email, user.login, passwordRecoveryCode)

        const isUpdated = await this.usersRepository.updatePasswordConfirmationInfo(user.id, passwordRecoveryCode)
        if (!isUpdated) {
            return false
        }
        return true
    }
}