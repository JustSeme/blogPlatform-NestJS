import { Injectable } from "@nestjs/common"
import { UsersRepository } from "../../infrastructure/users-db-repository"
import { v4 as uuidv4 } from 'uuid'
import { EmailManager } from "../../../general/managers/emailManager"

@Injectable()
export class ResendConfirmationCodeUseCase {
    constructor(
        private usersRepository: UsersRepository,
        private emailManager: EmailManager
    ) { }

    async execute(email: string) {
        const user = await this.usersRepository.findUserByEmail(email)
        if (!user || user.emailConfirmation.isConfirmed) return false

        const newConfirmationCode = uuidv4()
        await this.usersRepository.updateEmailConfirmationInfo(user.id, newConfirmationCode)

        try {
            return await this.emailManager.sendConfirmationCode(email, user.login, newConfirmationCode)
        } catch (error) {
            console.error(error)
            this.usersRepository.deleteUser(user.id)
            return false
        }
    }
}