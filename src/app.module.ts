//this line should be the first in app
import { configModule } from "./configuration/configModule"
import {
  ConfigModule, ConfigService
} from "@nestjs/config"
import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import {
  User, UsersSchema
} from "./general/users/domain/UsersSchema"
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
import { BlogsController } from "./blogs/api/blogs-controller"
import { BlogsService } from './blogs/application/blogs-service'
import { BlogsRepository } from './blogs/infrastructure/blogs/blogs-db-repository'
import { PostsController } from "./blogs/api/posts-controller"
import { CommentsController } from "./blogs/api/comments-controller"
import { AuthController } from "./auth/api/auth-controller"
import { SecurityController } from "./security/api/security-controller"
import { LocalStrategy } from "./auth/api/strategies/local.strategy"
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
import { UsersQueryRepository } from "./general/users/infrastructure/users-query-repository"
import { UsersRepository } from "./general/users/infrastructure/users-db-repository"
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
import { GmailConfig } from "./configuration/gmail.config"
import { AppConfig } from "./configuration/app.config"
import { LogoutUseCase } from "./auth/application/use-cases/logout.use-case"
import { LoginUseCase } from "./auth/application/use-cases/login.use-case"
import { ConfirmRecoveryPasswordUseCase } from "./auth/application/use-cases/confirm-recovery-password.use-case"
import { SendPasswordRecoveryCodeUseCase } from "./auth/application/use-cases/send-password-recovery-code.use-case"
import { ResendConfirmationCodeUseCase } from "./auth/application/use-cases/resend-confirmation-code.use-case"
import { ConfirmEmailUseCase } from "./auth/application/use-cases/confirm-email.use-case"
import { SuperAdminCreateUserUseCase } from "./SuperAdmin/application/use-cases/super-admin-create-user.use-case"
import { RegistrationUserUseCase } from "./auth/application/use-cases/registration-user.use-case"
import { DeleteUserUseCase } from "./SuperAdmin/application/use-cases/delete-user.use-case"
import { CqrsModule } from "@nestjs/cqrs"
import { CreateBlogUseCase } from "./blogs/application/use-cases/blogs/create-blog.use-case"
import { UpdateBlogUseCase } from "./blogs/application/use-cases/blogs/update-blog.use-case"
import { DeleteBlogUseCase } from "./blogs/application/use-cases/blogs/delete-blog.use-case"
import { PostsQueryRepository } from "./blogs/infrastructure/posts/posts-query-repository"
import { DeletePostUseCase } from "./blogs/application/use-cases/posts/delete-post.use-case"
import { UpdatePostUseCase } from "./blogs/application/use-cases/posts/update-post.use-case"
import { UpdateLikeStatusForPostUseCase } from "./blogs/application/use-cases/posts/update-like-status-for-post.use-case"
import { CreateCommentUseCase } from "./blogs/application/use-cases/comments/create-comment.use-case"
import { DeleteCommentUseCase } from "./blogs/application/use-cases/comments/delete-comment.use-case"
import { UpdateLikeStatusForCommentUseCase } from "./blogs/application/use-cases/comments/update-like-status-for-comment.use-case"
import { CreateBlogForBloggerUseCase } from "./Blogger/api/use-cases/blogs/create-blog-for-blogger.use-case"
import { BloggerBlogsController } from "./Blogger/api/blogger-blogs.controller"
import { JwtAuthGuard } from "./blogs/api/guards/jwt-auth.guard"
import { UpdateBlogForBloggerUseCase } from "./Blogger/api/use-cases/blogs/update-blog-for-blogger.use-case"
import { DeleteBlogForBloggerUseCase } from "./Blogger/api/use-cases/blogs/delete-blog-for-blogger.use-case"
import { CreatePostForBloggerUseCase } from "./Blogger/api/use-cases/posts/create-post-for-blogger.use-case"
import { UpdatePostForBloggerUseCase } from "./Blogger/api/use-cases/posts/update-post-for-blogger.use-case"
import { DeletePostForBloggerUseCase } from "./Blogger/api/use-cases/posts/delete-post-for-blogger.use-case"
import { SuperAdminBlogsController } from "./SuperAdmin/api/super-admin-blogs.controller"
import { BindUserUseCase } from "./SuperAdmin/application/use-cases/bind-user.use-case"
import { IsBlogExistOrThrow400Pipe } from "./SuperAdmin/api/pipes/isBlogExistsOrThrow400.validation.pipe"
import { IsUserExistOrThrow400Pipe } from "./SuperAdmin/api/pipes/isUserExistsOrThrow400.validation.pipe"
import { SuperAdminUsersController } from "./SuperAdmin/api/super-admin-users.controller"

const authUseCases = [
  LogoutUseCase,
  LoginUseCase,
  ConfirmRecoveryPasswordUseCase,
  SendPasswordRecoveryCodeUseCase,
  ResendConfirmationCodeUseCase,
  ConfirmEmailUseCase,
  SuperAdminCreateUserUseCase,
  RegistrationUserUseCase,
  DeleteUserUseCase,
]

const blogsUseCases = [
  DeleteBlogUseCase,
  DeleteBlogForBloggerUseCase,
  CreateBlogUseCase,
  CreateBlogForBloggerUseCase,
  UpdateBlogUseCase,
  UpdateBlogForBloggerUseCase,
  DeletePostUseCase,
  UpdatePostUseCase,
  CreatePostForBloggerUseCase,
  UpdateLikeStatusForPostUseCase,
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateLikeStatusForCommentUseCase,
  UpdatePostForBloggerUseCase,
  DeletePostForBloggerUseCase,
  BindUserUseCase,
]

const strategies = [
  LocalStrategy,
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
  PostsQueryRepository,
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
  IsBlogExistOrThrow400Pipe,
  IsUserExistOrThrow400Pipe,
]

const guards = [
  IpRestrictionGuard,
  JwtAuthGuard,
]

const configs = [
  BlogsConfig,
  AuthConfig,
  GmailConfig,
  AppConfig,
]

@Module({
  imports: [
    CqrsModule,
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
  controllers: [AppController, SuperAdminUsersController, BlogsController, PostsController, CommentsController, AuthController, SecurityController, BloggerBlogsController, SuperAdminBlogsController,],
  providers: [
    ...strategies,
    ...authUseCases,
    ...blogsUseCases,
    ...services,
    ...adapters,
    ...repositories,
    ...decorators,
    ...guards,
    ...configs,
  ],
})

export class AppModule { }
