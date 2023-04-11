import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersController } from './auth/api/users-controller'
import { AuthService } from './auth/application/auth-service'
import { EmailManager } from './managers/emailManager'
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
import { JwtService } from './adapters/jwtService'
import { PostsController } from './blogs/api/posts-controller'
import { CommentsController } from './blogs/api/comments-controller'
import { CommentsService } from './blogs/application/comments-service'
import { CommentsQueryRepository } from './blogs/infrastructure/comments-query-repository'
import { CommentsRepository } from './blogs/infrastructure/comments-db-repository'
import { AuthController } from './auth/api/auth-controller'
import { PassportModule } from '@nestjs/passport'
import { LocalStrategy } from './auth/api/strategies/local.strategy'
import { JwtStrategy } from './blogs/strategies/jwt.strategy'


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
      }
    ]),
    PassportModule,
  ],
  controllers: [AppController, UsersController, BlogsController, PostsController, CommentsController, AuthController],
  providers: [
    AppService, AuthService, EmailManager, UsersQueryRepository, UsersRepository, LocalStrategy, JwtStrategy,
    JwtService,
    BlogsService, BlogsQueryRepository, BlogsRepository,
    PostsService, PostsRepository,
    CommentsService, CommentsQueryRepository, CommentsRepository
  ],
})
export class AppModule { }
