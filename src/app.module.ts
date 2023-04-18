import { Module } from "@nestjs/common"
import {
  ConfigModule, ConfigService
} from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import {
  ThrottlerGuard, ThrottlerModule
} from "@nestjs/throttler"
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
import { AuthService } from "./auth/application/auth-service"
import { JwtService } from "./general/adapters/JwtService"
import { PostsService } from "./blogs/application/posts-service"
import { CommentsService } from "./blogs/application/comments-service"
import { SecurityService } from "./security/application/security-service"
import { EmailManager } from "./general/managers/emailManager"
import { BcryptAdapter } from "./general/adapters/BcryptAdapter"
import { EmailAdapter } from "./general/adapters/EmailAdapter"
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
import { APP_GUARD } from "@nestjs/core"



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({ uri: configService.get<string>('mongoURI') }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 7
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
      }
    ]),
    PassportModule,
  ],
  controllers: [AppController, UsersController, BlogsController, PostsController, CommentsController, AuthController, SecurityController],
  providers: [
    // strategies
    LocalStrategy,
    JwtStrategy,
    BasicStrategy,
    // services
    AppService,
    AuthService,
    JwtService,
    BlogsService,
    PostsService,
    CommentsService,
    SecurityService,
    // adapters
    EmailManager,
    BcryptAdapter,
    EmailAdapter,
    // repositories
    BlogsQueryRepository,
    CommentsQueryRepository,
    UsersQueryRepository,
    UsersRepository,
    PostsRepository,
    BlogsRepository,
    CommentsRepository,
    DeviceRepository,
    // decorators
    IsBlogByIdExist,
    IsEmailAlreadyInUse,
    IsLoginAlreadyInUse,
    IsDeviceExistsPipe,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})

export class AppModule { }
