import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersController } from './auth/api/users-controller'
import { AuthService } from './auth/application/auth-service'
import { EmailManager } from './general/managers/emailManager'
import { UsersQueryRepository } from './auth/infrastructure/users-query-repository'
import { MongooseModule } from '@nestjs/mongoose'
import { settings } from './settings'
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
import { JwtService } from './general/adapters/jwtService'
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
import {
  Attempt, AttemptSchema
} from './security/domain/AttemptsSchema'
import { JwtStrategy } from './blogs/api/strategies/jwt.strategy'
import { RefreshJwtStrategy } from './security/api/strategies/refresh-jwt.strategy'
import { SecurityController } from './security/api/security-controller'
import { SecurityService } from './security/application/security-service'
import { AttemptsRepository } from './security/infrastructure/attempts-db-repository'
import { DeviceRepository } from './security/infrastructure/device-db-repository'


@Module({
  imports: [
    MongooseModule.forRoot(settings.mongoURI),
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
        schema: AttemptSchema
      },
    ]),
    PassportModule,
  ],
  controllers: [AppController, UsersController, BlogsController, PostsController, CommentsController, AuthController, SecurityController],
  providers: [
    AppService, AuthService, EmailManager, UsersQueryRepository, UsersRepository, LocalStrategy, JwtStrategy, BasicStrategy, RefreshJwtStrategy,
    JwtService,
    BlogsService, BlogsQueryRepository, BlogsRepository,
    PostsService, PostsRepository,
    CommentsService, CommentsQueryRepository, CommentsRepository,
    SecurityService, AttemptsRepository, DeviceRepository
  ],
})
export class AppModule { }
