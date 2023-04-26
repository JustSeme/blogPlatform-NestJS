import { AuthService } from "../application/auth.service"
import { ReadUsersQuery } from "./models/ReadUsersQuery"
import { UserInputModel } from "./models/UserInputModel"
import {
    UsersWithQueryOutputModel, UserViewModelType
} from "../application/dto/UsersViewModel"
import { UsersQueryRepository } from "../infrastructure/users-query-repository"
import {
    Body, Controller, Delete, Get, Param, Post, Query, HttpCode, NotFoundException, HttpStatus, NotImplementedException, UseGuards
} from "@nestjs/common"
import { ErrorMessagesOutputModel } from "../../general/types/ErrorMessagesOutputModel"
import { BasicAuthGuard } from "../../blogs/api/guards/basic-auth.guard"
import { SuperAdminCreateUserCommand } from "../application/use-cases/super-admin-create-user.use-case"
import {
    DeleteUserCommand, DeleteUserUseCase
} from "../application/use-cases/delete-user.use-case"
import { CommandBus } from "@nestjs/cqrs/dist"

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
    constructor(
        protected authService: AuthService,
        protected usersQueryRepository: UsersQueryRepository,
        protected deleteUserUseCase: DeleteUserUseCase,
        private commandBus: CommandBus,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() userInputModel: UserInputModel): Promise<UserViewModelType | ErrorMessagesOutputModel | number> {
        const createdUser = await this.commandBus.execute(
            new SuperAdminCreateUserCommand(userInputModel.login, userInputModel.password, userInputModel.email)
        )
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
    async deleteUser(@Param('id',) id: string): Promise<void> {
        const isDeleted = await this.commandBus.execute(new DeleteUserCommand(id))
        if (!isDeleted) {
            throw new NotFoundException()
        }
    }
}