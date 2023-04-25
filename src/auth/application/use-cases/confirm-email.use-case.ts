import { Injectable } from "@nestjs/common"
import { UsersRepository } from "../../infrastructure/users-db-repository"

@Injectable()
export class ConfirmEmailUseCase {
    constructor(
        private usersRepository: UsersRepository,
    ) { }

    async execute(code: string) {
        const user = await this.usersRepository.findUserByConfirmationCode(code)
        if (!user) return false

        if (!user.canBeConfirmed(code)) {
            return false
        }
        const isConfirmed = user.updateIsConfirmed()
        if (isConfirmed) {
            this.usersRepository.save(user)
        }
        return isConfirmed
    }
}