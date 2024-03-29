import {
    Body,
    Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, NotImplementedException, Param, Post, Put, Query, UseGuards
} from '@nestjs/common'
import { BasicAuthGuard } from '../../general/guards/basic-auth.guard'
import { CommandBus } from '@nestjs/cqrs'
import { DeleteUserCommand } from '../application/use-cases/users/delete-user.use-case'
import { UserInputModel } from './models/users/UserInputModel'
import {
    UserViewModelType, UsersWithQueryOutputModel
} from '../application/dto/users/UsersViewModel'
import { ErrorMessagesOutputModel } from '../../general/types/ErrorMessagesOutputModel'
import { CreateUserCommand } from '../application/use-cases/users/create-user.use-case'
import { ReadUsersQuery } from './models/users/ReadUsersQuery'
import { IsUserExistOrThrow400Pipe } from './pipes/isUserExistsOrThrow400.validation.pipe'
import { IsUserExistPipe } from './pipes/isUserExists.validation.pipe'
import { UsersService } from '../application/users.service'
import { BanUserInputModel } from './models/users/BanUserInputModel'
import { UsersTypeORMQueryRepository } from '../infrastructure/typeORM/users-typeORM-query-repository'
import { UpdateBanUserCommand } from '../application/use-cases/users/update-ban-user.use-case'

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class SuperAdminUsersController {
    constructor(
        protected usersQueryRepository: UsersTypeORMQueryRepository,
        protected usersTypeORMQueryRepository: UsersTypeORMQueryRepository,
        protected usersService: UsersService,
        private commandBus: CommandBus,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() userInputModel: UserInputModel): Promise<UserViewModelType | ErrorMessagesOutputModel> {
        const createdUserId = await this.commandBus.execute(
            new CreateUserCommand(userInputModel.login, userInputModel.password, userInputModel.email)
        )
        if (!createdUserId) {
            throw new NotImplementedException()
        }

        return this.usersTypeORMQueryRepository.findUserById(createdUserId)
    }

    @Get()
    async getUsers(
        @Query() usersQueryInputModel: ReadUsersQuery
    ): Promise<UsersWithQueryOutputModel> {
        const findedUsersQueryData = await this.usersQueryRepository.findUsers(usersQueryInputModel)

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
        @Body() banUserInputModel: BanUserInputModel
    ) {
        const isImplemented = await this.commandBus.execute(
            new UpdateBanUserCommand(banUserInputModel, userId)
        )

        if (!isImplemented) {
            throw new NotImplementedException()
        }
    }
}