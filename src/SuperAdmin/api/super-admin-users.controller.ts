import {
    Body,
    Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, NotImplementedException, Param, Post, Query, UseGuards
} from '@nestjs/common'
import { BasicAuthGuard } from '../../general/guards/basic-auth.guard'
import { CommandBus } from '@nestjs/cqrs'
import { UsersQueryRepository } from '../../general/users/infrastructure/users-query-repository'
import { DeleteUserCommand } from '../application/use-cases/delete-user.use-case'
import { UserInputModel } from './models/UserInputModel'
import {
    UserViewModelType, UsersWithQueryOutputModel
} from '../application/dto/UsersViewModel'
import { ErrorMessagesOutputModel } from '../../general/types/ErrorMessagesOutputModel'
import { SuperAdminCreateUserCommand } from '../application/use-cases/super-admin-create-user.use-case'
import { ReadUsersQuery } from './models/ReadUsersQuery'

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class SuperAdminUsersController {
    constructor(
        protected usersQueryRepository: UsersQueryRepository,
        private commandBus: CommandBus,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() userInputModel: UserInputModel): Promise<UserViewModelType | ErrorMessagesOutputModel> {
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
        const isDeleted = await this.commandBus.execute(
            new DeleteUserCommand(id)
        )
        if (!isDeleted) {
            throw new NotFoundException()
        }
    }
}