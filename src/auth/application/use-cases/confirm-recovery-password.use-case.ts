
import { Injectable } from "@nestjs/common"
import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { UsersRepository } from "../../infrastructure/users-db-repository"

@Injectable()
export class ConfirmRecoveryPasswordUseCase {
    constructor(
        private bcryptAdapter: BcryptAdapter,
        private usersRepository: UsersRepository,
    ) {
    }

    async execute(userId: string, newPassword: string) {
        const newPasswordHash = await this.bcryptAdapter.generatePasswordHash(newPassword, 10)

        return this.usersRepository.updateUserPassword(userId, newPasswordHash)
    }
}