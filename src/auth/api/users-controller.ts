import { AuthService } from "../application/auth-service"
import { ReadUsersQuery } from "./models/ReadUsersQuery"
import { UserInputModel } from "../application/dto/UserInputModel"
import { UsersWithQueryOutputModel, UserViewModelType } from "./models/UsersViewModel"
import { UsersQueryRepository } from "../infrastructure/users-query-repository"
import { HTTP_STATUSES } from "src/settings"
import { ErrorMessagesOutputModel } from "src/types/ErrorMessagesOutputModel"
import {
    Body, Controller, Delete, Get, Param, Post, Query, HttpCode, NotFoundException, BadRequestException
} from "@nestjs/common"

@Controller('users')
export class UsersController {
    constructor(protected authService: AuthService, protected usersQueryRepository: UsersQueryRepository) { }

    @Post()
    @HttpCode(HTTP_STATUSES.CREATED_201)
    async createUser(@Body() userInputModel: UserInputModel): Promise<UserViewModelType | ErrorMessagesOutputModel | number> {
        const createdUser = await this.authService.createUserWithBasicAuth(userInputModel.login, userInputModel.password, userInputModel.email)
        if (!createdUser) {
            throw new BadRequestException()
        }

        return createdUser
    }

    @Get()
    async getUsers(@Query() usersQueryInputModel: ReadUsersQuery): Promise<UsersWithQueryOutputModel> {
        const findedUsers = await this.usersQueryRepository.findUsers(usersQueryInputModel)

        return findedUsers
    }

    @Delete(':id')
    @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
    async deleteUser(@Param('id') id: string): Promise<void> {
        const isDeleted = await this.authService.deleteUsers(id)
        if (!isDeleted) {
            throw new NotFoundException()
        }
    }
}