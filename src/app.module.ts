import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersController } from './auth/api/users-controller'
import { AuthService } from './auth/application/auth-service'
import { EmailManager } from './general/managers/emailManager'
import { UsersQueryRepository } from './auth/infrastructure/users-query-repository'
import { MongooseModule } from '@nestjs/mongoose'
import {
  User, UsersSchema
} from './auth/domain/UsersSchema'
import { UsersRepository } from './auth/infrastructure/users-db-repository'
import { BlogsService } from './blogs/application/blogs-service'
import { BlogsQueryRepository } from './blogs/infrastructure/blogs/blogs-query-repository'
import { BlogsRepository } from './blogs/infrastructure/blogs/blogs-db-repository'
import { BlogsController } from './blogs/api/blogs-controller'
import {
  Blog, BlogSchema
} from './blogs/domain/blogs/BlogsSchema'
import {
  Post, PostSchema
} from './blogs/domain/posts/PostsSchema'
import {
  Comment, CommentsSchema
} from './blogs/domain/comments/commentsSchema'
import { PostsService } from './blogs/application/posts-service'
import { PostsRepository } from './blogs/infrastructure/posts/posts-db-repository'
import { JwtService } from './general/adapters/JwtService'
import { PostsController } from './blogs/api/posts-controller'
import { CommentsController } from './blogs/api/comments-controller'
import { CommentsService } from './blogs/application/comments-service'
import { CommentsQueryRepository } from './blogs/infrastructure/comments/comments-query-repository'
import { CommentsRepository } from './blogs/infrastructure/comments/comments-db-repository'
import { AuthController } from './auth/api/auth-controller'
import { PassportModule } from '@nestjs/passport'
import { LocalStrategy } from './auth/api/strategies/local.strategy'
import { BasicStrategy } from './blogs/api/strategies/basic.strategy'
import {
  DeviceAuthSession, DeviceAuthSessionsSchema
} from './security/domain/DeviceAuthSessionSchema'
import { JwtStrategy } from './blogs/api/strategies/jwt.strategy'
import { SecurityController } from './security/api/security-controller'
import { SecurityService } from './security/application/security-service'
import { DeviceRepository } from './security/infrastructure/device-db-repository'
import {
  ThrottlerGuard, ThrottlerModule
} from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { BcryptAdapter } from './general/adapters/BcryptAdapter'
import { EmailAdapter } from './general/adapters/EmailAdapter'
import {
  ConfigModule, ConfigService
} from '@nestjs/config'
import { IsBlogByIdExist } from './general/decorators/isBlogExists.validation.decorator'
import { IsEmailAlreadyInUse } from './auth/api/decorators/IsEmailAlreadyInUse'
import { IsLoginAlreadyInUse } from './auth/api/decorators/IsLoginAlreadyInUse'


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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})

export class AppModule { }
