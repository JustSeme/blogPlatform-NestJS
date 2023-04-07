import { AuthService } from "../application/auth-service"
import { ReadUsersQuery } from "./models/ReadUsersQuery"
import { UserInputModel } from "./models/UserInputModel"
import {
    UsersWithQueryOutputModel, UserViewModelType
} from "../application/dto/UsersViewModel"
import { UsersQueryRepository } from "../infrastructure/users-query-repository"
import { ErrorMessagesOutputModel } from "src/types/ErrorMessagesOutputModel"
import {
    Body, Controller, Delete, Get, Param, Post, Query, HttpCode, NotFoundException, HttpStatus, ParseUUIDPipe, NotImplementedException
} from "@nestjs/common"

@Controller('users')
export class UsersController {
    constructor(protected authService: AuthService, protected usersQueryRepository: UsersQueryRepository) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() userInputModel: UserInputModel): Promise<UserViewModelType | ErrorMessagesOutputModel | number> {
        const createdUser = await this.authService.createUserWithBasicAuth(userInputModel.login, userInputModel.password, userInputModel.email)
        if (!createdUser) {
            throw new NotImplementedException()
        }

        return createdUser
    }

    @Get()
    async getUsers(@Query() usersQueryInputModel: ReadUsersQuery): Promise<UsersWithQueryOutputModel> {
        const findedUsers = await this.usersQueryRepository.findUsers(usersQueryInputModel)

        return findedUsers
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUser(@Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND })) id: string): Promise<void> {
        const isDeleted = await this.authService.deleteUsers(id)
        if (!isDeleted) {
            throw new NotFoundException()
        }
    }
}