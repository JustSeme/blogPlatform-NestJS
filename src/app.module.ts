//this line should be the first in app
import { configModule } from "./configuration/configModule"
import {
  ConfigModule, ConfigService
} from "@nestjs/config"
import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import {
  User, UsersSchema
} from "./auth/domain/UsersSchema"
import {
  Blog, BlogSchema
} from "./blogs/domain/blogs/BlogsSchema"
import {
  Post, PostSchema
} from "./blogs/domain/posts/PostsSchema"
import {
  Comment, CommentsSchema
} from "./blogs/domain/comments/commentsSchema"
import {
  DeviceAuthSession, DeviceAuthSessionsSchema
} from "./security/domain/DeviceAuthSessionSchema"
import { PassportModule } from "@nestjs/passport"
import { AppController } from "./app.controller"
import { UsersController } from "./auth/api/users-controller"
import { BlogsController } from "./blogs/api/blogs-controller"
import { BlogsService } from './blogs/application/blogs-service'
import { BlogsRepository } from './blogs/infrastructure/blogs/blogs-db-repository'
import { PostsController } from "./blogs/api/posts-controller"
import { CommentsController } from "./blogs/api/comments-controller"
import { AuthController } from "./auth/api/auth-controller"
import { SecurityController } from "./security/api/security-controller"
import { LocalStrategy } from "./auth/api/strategies/local.strategy"
import { JwtStrategy } from "./blogs/api/strategies/jwt.strategy"
import { BasicStrategy } from "./blogs/api/strategies/basic.strategy"
import { AppService } from "./app.service"
import { AuthService } from "./auth/application/auth.service"
import { JwtService } from "./general/adapters/jwt.adapter"
import { PostsService } from "./blogs/application/posts-service"
import { CommentsService } from "./blogs/application/comments-service"
import { SecurityService } from "./security/application/security-service"
import { EmailManager } from "./general/managers/emailManager"
import { BcryptAdapter } from "./general/adapters/bcrypt.adapter"
import { EmailAdapter } from "./general/adapters/email.adapter"
import { BlogsQueryRepository } from "./blogs/infrastructure/blogs/blogs-query-repository"
import { CommentsQueryRepository } from "./blogs/infrastructure/comments/comments-query-repository"
import { UsersQueryRepository } from "./auth/infrastructure/users-query-repository"
import { UsersRepository } from "./auth/infrastructure/users-db-repository"
import { PostsRepository } from "./blogs/infrastructure/posts/posts-db-repository"
import { CommentsRepository } from "./blogs/infrastructure/comments/comments-db-repository"
import { DeviceRepository } from "./security/infrastructure/device-db-repository"
import { IsBlogByIdExist } from "./general/decorators/isBlogExists.validation.decorator"
import { IsEmailAlreadyInUse } from "./auth/api/decorators/IsEmailAlreadyInUse"
import { IsLoginAlreadyInUse } from "./auth/api/decorators/IsLoginAlreadyInUse"
import { IsDeviceExistsPipe } from "./security/api/pipes/isDeviceExists.validation.pipe"
import {
  Attempt, AttemptsSchema
} from "./security/domain/AttemptsSchema"
import { AttemptsRepository } from "./security/infrastructure/attempts-db-repository"
import { IpRestrictionGuard } from "./auth/api/guards/ip-restriction.guard"
import { BlogsConfig } from "./configuration/blogs.config"
import { AuthConfig } from "./configuration/auth.config"
import { EmailConfig } from "./configuration/Email.config"
import { AppConfig } from "./configuration/app.config"
import { LogoutUseCase } from "./auth/application/use-cases/logout.use-case"
import { LoginUseCase } from "./auth/application/use-cases/login.use-case"
import { ConfirmRecoveryPasswordUseCase } from "./auth/application/use-cases/confirm-recovery-password.use-case"
import { SendPasswordRecoveryCode } from "./auth/application/use-cases/send-password-recovery-code.use-case"
import { ResendConfirmationCodeUseCase } from "./auth/application/use-cases/resend-confirmation-code.use-case"
import { ConfirmEmailUseCase } from "./auth/application/use-cases/confirm-email.use-case"
import { SuperAdminCreateUserUseCase } from "./auth/application/use-cases/super-admin-create-user.use-case"
import { RegistrationUserUseCase } from "./auth/application/use-cases/registration-user.use-case"

const useCases = [
  LogoutUseCase,
  LoginUseCase,
  ConfirmRecoveryPasswordUseCase,
  SendPasswordRecoveryCode,
  ResendConfirmationCodeUseCase,
  ConfirmEmailUseCase,
  SuperAdminCreateUserUseCase,
  RegistrationUserUseCase,
]

const strategies = [
  LocalStrategy,
  JwtStrategy,
  BasicStrategy,
]

const services = [
  AppService,
  AuthService,
  JwtService,
  BlogsService,
  PostsService,
  CommentsService,
  SecurityService,
]

const adapters = [
  EmailManager,
  BcryptAdapter,
  EmailAdapter,
]

const repositories = [
  BlogsQueryRepository,
  CommentsQueryRepository,
  UsersQueryRepository,
  UsersRepository,
  PostsRepository,
  BlogsRepository,
  CommentsRepository,
  DeviceRepository,
  AttemptsRepository,
]

const decorators = [
  IsBlogByIdExist,
  IsEmailAlreadyInUse,
  IsLoginAlreadyInUse,
  IsDeviceExistsPipe,
]

const guards = [
  IpRestrictionGuard,
]

const configs = [
  BlogsConfig,
  AuthConfig,
  EmailConfig,
  AppConfig,
]

@Module({
  imports: [
    configModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (ConfigService: ConfigService) => ({ uri: ConfigService.get<string>('mongoURI') }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UsersSchema
      },

      {
        name: Blog.name,
        schema: BlogSchema
      },
      {
        name: Post.name,
        schema: PostSchema
      },
      {
        name: Comment.name,
        schema: CommentsSchema
      },

      {
        name: DeviceAuthSession.name,
        schema: DeviceAuthSessionsSchema
      },
      {
        name: Attempt.name,
        schema: AttemptsSchema
      },
    ]),
    PassportModule,
  ],
  controllers: [AppController, UsersController, BlogsController, PostsController, CommentsController, AuthController, SecurityController],
  providers: [
    ...strategies,
    ...useCases,
    ...services,
    ...adapters,
    ...repositories,
    ...decorators,
    ...guards,
    ...configs,
  ],
})

export class AppModule { }
