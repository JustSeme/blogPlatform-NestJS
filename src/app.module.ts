import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersController } from './auth/api/controllers/users-controller'
import { AuthService } from './auth/application/auth-service'
import { EmailManager } from './managers/emailManager'
import { UsersQueryRepository } from './auth/infrastructure/users-query-repository'
import { MongooseModule } from '@nestjs/mongoose'
import { settings } from './settings'
import { User, UsersSchema } from './auth/domain/UsersSchema'

@Module({
  imports: [
    MongooseModule.forRoot(settings.mongoURI),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UsersSchema
      }
    ])
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, AuthService, EmailManager, UsersQueryRepository],
})
export class AppModule { }
