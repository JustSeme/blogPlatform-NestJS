import {
    Body,
    Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, NotImplementedException, Param, Post, Put, Query, UseGuards
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
import { CreateUserCommand } from '../application/use-cases/create-user.use-case'
import { ReadUsersQuery } from './models/ReadUsersQuery'
import { IsUserExistOrThrow400Pipe } from './pipes/isUserExistsOrThrow400.validation.pipe'
import { IsUserExistPipe } from './pipes/isUserExists.validation.pipe'
import { BanInputModel } from './models/BanInputModel'
import { BanUserCommand } from '../application/use-cases/ban-user.use-case'
import { UnbanUserCommand } from '../application/use-cases/unban-user.use-case'
import { UsersService } from '../../general/users/users.service'

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class SuperAdminUsersController {
    constructor(
        protected usersQueryRepository: UsersQueryRepository,
        protected usersService: UsersService,
        private commandBus: CommandBus,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() userInputModel: UserInputModel): Promise<UserViewModelType | ErrorMessagesOutputModel> {
        const createdUser = await this.commandBus.execute(
            new CreateUserCommand(userInputModel.login, userInputModel.password, userInputModel.email)
        )
        if (!createdUser) {
            throw new NotImplementedException()
        }

        return createdUser
    }

    @Get()
    async getUsers(
        @Query() usersQueryInputModel: ReadUsersQuery
    ): Promise<UsersWithQueryOutputModel> {
        const findedUsersQueryData = await this.usersQueryRepository.findUsers(usersQueryInputModel)

        findedUsersQueryData.items = this.usersService.prepareUsersForDisplay(findedUsersQueryData.items)

        return findedUsersQueryData
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUser(
        @Param('id', IsUserExistPipe) id: string): Promise<void> {
        const isDeleted = await this.commandBus.execute(
            new DeleteUserCommand(id)
        )
        if (!isDeleted) {
            throw new NotFoundException()
        }
    }

    @Put(':userId/ban')
    @HttpCode(HttpStatus.NO_CONTENT)
    async banUser(
        @Param('userId', IsUserExistOrThrow400Pipe) userId: string,
        @Body() banInputModel: BanInputModel
    ) {
        if (banInputModel.isBanned) {
            await this.commandBus.execute(
                new BanUserCommand(banInputModel, userId)
            )
        } else {
            await this.commandBus.execute(
                new UnbanUserCommand(userId)
            )
        }
    }
}