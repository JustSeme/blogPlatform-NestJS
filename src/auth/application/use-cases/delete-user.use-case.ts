import { Injectable } from "@nestjs/common"
import { UsersRepository } from "../../infrastructure/users-db-repository"

@Injectable()
export class DeleteUserUseCase {
    constructor(private usersRepository: UsersRepository) { }

    async execute(userId: string) {
        return this.usersRepository.deleteUser(userId)
    }
}