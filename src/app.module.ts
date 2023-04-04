import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersController } from './auth/api/users-controller'
import { AuthService } from './auth/application/auth-service'
import { EmailManager } from './managers/emailManager'
import { UsersQueryRepository } from './auth/infrastructure/users-query-repository'
import { MongooseModule } from '@nestjs/mongoose'
import { settings } from './settings'
import { User, UsersSchema } from './auth/domain/UsersSchema'
import { UsersRepository } from './auth/infrastructure/users-db-repository'
import { BlogsService } from './blogs/application/blogs-service'
import { BlogsQueryRepository } from './blogs/infrastructure/blogs-query-repository'
import { BlogsRepository } from './blogs/infrastructure/blogs-db-repository'
import { BlogsController } from './blogs/api/blogs-controller'

@Module({
  imports: [
    MongooseModule.forRoot(settings.mongoURI),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UsersSchema
      }
    ]),
  ],
  controllers: [AppController, UsersController, BlogsController],
  providers: [
    AppService, AuthService, EmailManager, UsersQueryRepository, UsersRepository,
    BlogsService, BlogsQueryRepository, BlogsRepository
  ],
})
export class AppModule { }
