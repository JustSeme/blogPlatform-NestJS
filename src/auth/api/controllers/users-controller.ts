import { AuthService } from "../../application/auth-service"
import { ReadUsersQuery } from "../models/ReadUsersQuery"
import { UserInputModel } from "../../application/dto/UserInputModel"
import { UsersWithQueryOutputModel, UserViewModelType } from "../models/UsersViewModel"
import { UsersQueryRepository } from "../../infrastructure/users-query-repository"
import { HTTP_STATUSES } from "src/settings"
import { ErrorMessagesOutputModel } from "src/types/ErrorMessagesOutputModel"
import {
    Body, Controller, Delete, Get, Param, Post, Query
} from "@nestjs/common"

@Controller('users')
export class UsersController {
    constructor(protected authService: AuthService, protected usersQueryRepository: UsersQueryRepository) { }

    @Post()
    async createUser(@Body() userInputModel: UserInputModel): Promise<UserViewModelType | ErrorMessagesOutputModel | number> {
        const createdUser = await this.authService.createUserWithBasicAuth(userInputModel.login, userInputModel.password, userInputModel.email)
        if (!createdUser) {
            return HTTP_STATUSES.BAD_REQUEST_400
        }

        return createdUser
    }

    @Get()
    async getUsers(@Query() usersQueryInputModel: ReadUsersQuery): Promise<UsersWithQueryOutputModel> {
        const findedUsers = await this.usersQueryRepository.findUsers(usersQueryInputModel)

        return findedUsers
    }

    @Delete('id')
    async deleteUser(@Param() id: string): Promise<number> {
        const isDeleted = await this.authService.deleteUsers(id)
        if (!isDeleted) {
            return HTTP_STATUSES.NOT_FOUND_404
        }
        return HTTP_STATUSES.NO_CONTENT_204
    }
}