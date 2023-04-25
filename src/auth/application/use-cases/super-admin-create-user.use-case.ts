import { Injectable } from "@nestjs/common"
import { BcryptAdapter } from "../../../general/adapters/bcrypt.adapter"
import { UserViewModelType } from "../dto/UsersViewModel"
import { InjectModel } from "@nestjs/mongoose"
import { User } from "../../domain/UsersSchema"
import { UserModelType } from "../../domain/UsersTypes"
import { UsersRepository } from "../../infrastructure/users-db-repository"
import { AuthService } from "../auth.service"

@Injectable()
export class SuperAdminCreateUserUseCase {
    constructor(
        @InjectModel(User.name) private UserModel: UserModelType,
        private bcryptAdapter: BcryptAdapter,
        private usersRepository: UsersRepository,
        private authService: AuthService,
    ) { }

    async execute(login: string, password: string, email: string): Promise<UserViewModelType | null> {
        const passwordHash = await this.bcryptAdapter.generatePasswordHash(password, 10)

        const newUser = this.UserModel.makeInstance(login, email, passwordHash, true, this.UserModel)

        await this.usersRepository.save(newUser)
        const displayedUser: UserViewModelType = this.authService.prepareUserForDisplay(newUser)

        return displayedUser
    }
}