//this line should be the first in app
import { configModule } from "./configuration/configModule"
import {
  ConfigModule, ConfigService
} from "@nestjs/config"
import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import {
  Blog, BlogSchema
} from "./Blogger/domain/blogs/BlogsSchema"
import {
  Post, PostSchema
} from "./Blogger/domain/posts/PostsSchema"
import {
  DeviceAuthSession, DeviceAuthSessionsSchema
} from "./security/domain/DeviceAuthSessionSchema"
import { PassportModule } from "@nestjs/passport"
import { AppController } from "./app.controller"
import { BlogsController } from "./blogs/api/blogs-controller"
import { BlogsService } from './blogs/application/blogs-service'
import { BlogsRepository } from './Blogger/infrastructure/blogs/blogs-db-repository'
import { PostsController } from "./blogs/api/posts-controller"
import { CommentsController } from "./blogs/api/comments-controller"
import { AuthController } from "./auth/api/auth-controller"
import { SecurityController } from "./security/api/security-controller"
import { LocalStrategy } from "./auth/api/strategies/local.strategy"
import { BasicStrategy } from "./general/strategies/basic.strategy"
import { AppService } from "./app.service"
import { JwtService } from "./general/adapters/jwt.adapter"
import { PostsService } from "./blogs/application/posts-service"
import { CommentsService } from "./blogs/application/comments-service"
import { SecurityService } from "./security/application/security-service"
import { EmailManager } from "./general/managers/emailManager"
import { BcryptAdapter } from "./general/adapters/bcrypt.adapter"
import { EmailAdapter } from "./general/adapters/email.adapter"
import { BlogsQueryRepository } from "./Blogger/infrastructure/blogs/blogs-query-repository"
import { CommentsQueryRepository } from "./blogs/infrastructure/comments/comments-query-repository"
import { PostsRepository } from "./Blogger/infrastructure/posts/posts-db-repository"
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
import { CreateUserUseCase } from "./SuperAdmin/application/use-cases/create-user.use-case"
import { RegistrationUserUseCase } from "./auth/application/use-cases/registration-user.use-case"
import { DeleteUserUseCase } from "./SuperAdmin/application/use-cases/delete-user.use-case"
import { CqrsModule } from "@nestjs/cqrs"
import { CreateBlogUseCase } from "./blogs/application/use-cases/blogs/create-blog.use-case"
import { UpdateBlogUseCase } from "./blogs/application/use-cases/blogs/update-blog.use-case"
import { DeleteBlogUseCase } from "./blogs/application/use-cases/blogs/delete-blog.use-case"
import { PostsQueryRepository } from "./Blogger/infrastructure/posts/posts-query-repository"
import { DeletePostUseCase } from "./blogs/application/use-cases/posts/delete-post.use-case"
import { UpdatePostUseCase } from "./blogs/application/use-cases/posts/update-post.use-case"
import { UpdateLikeStatusForPostUseCase } from "./blogs/application/use-cases/posts/update-like-status-for-post.use-case"
import { CreateCommentUseCase } from "./blogs/application/use-cases/comments/create-comment.use-case"
import { DeleteCommentUseCase } from "./blogs/application/use-cases/comments/delete-comment.use-case"
import { UpdateLikeStatusForCommentUseCase } from "./blogs/application/use-cases/comments/update-like-status-for-comment.use-case"
import { CreateBlogForBloggerUseCase } from "./Blogger/application/use-cases/blogs/create-blog-for-blogger.use-case"
import { BloggerBlogsController } from "./Blogger/api/blogger-blogs.controller"
import { JwtAuthGuard } from "./general/guards/jwt-auth.guard"
import { UpdateBlogForBloggerUseCase } from "./Blogger/application/use-cases/blogs/update-blog-for-blogger.use-case"
import { DeleteBlogForBloggerUseCase } from "./Blogger/application/use-cases/blogs/delete-blog-for-blogger.use-case"
import { CreatePostForBloggerUseCase } from "./Blogger/application/use-cases/posts/create-post-for-blogger.use-case"
import { UpdatePostForBloggerUseCase } from "./Blogger/application/use-cases/posts/update-post-for-blogger.use-case"
import { DeletePostForBloggerUseCase } from "./Blogger/application/use-cases/posts/delete-post-for-blogger.use-case"
import { SuperAdminBlogsController } from "./SuperAdmin/api/super-admin-blogs.controller"
import { BindUserUseCase } from "./SuperAdmin/application/use-cases/bind-user.use-case"
import { IsBlogExistOrThrow400Pipe } from "./SuperAdmin/api/pipes/isBlogExistsOrThrow400.validation.pipe"
import { IsUserExistOrThrow400Pipe } from "./SuperAdmin/api/pipes/isUserExistsOrThrow400.validation.pipe"
import { SuperAdminUsersController } from "./SuperAdmin/api/super-admin-users.controller"
import { BanUserUseCase } from "./SuperAdmin/application/use-cases/ban-user.use-case"
import { UnbanUserUseCase } from "./SuperAdmin/application/use-cases/unban-user.use-case"
import { RemoveAllSessionsExcludeCurrentUseCase } from "./security/application/use-cases/remove-all-sessions-exclude-current.use-case"
import { DeleteDeviceUseCase } from "./security/application/use-cases/delete-device.use-case"
import { GetActiveDevicesUseCase } from "./security/application/use-cases/get-active-devices-for-user.use-case"
import {
  CommentEntity, CommentsSchema
} from "./blogs/domain/comments/Comments.schema"
import { UsersService } from "./SuperAdmin/application/users.service"
import { GetBlogsUseCase } from "./blogs/application/use-cases/blogs/get-blogs.use-case"
import { GetBlogByIdUseCase } from "./blogs/application/use-cases/blogs/get-blog-by-id.use-case"
import { GetBlogsForBloggerUseCase } from "./Blogger/application/use-cases/blogs/get-blogs-for-blogger.use.case"
import { UsersRepository } from "./SuperAdmin/infrastructure/users-db-repository"
import { UsersQueryRepository } from "./SuperAdmin/infrastructure/users-query-repository"
import {
  User, UsersSchema
} from "./SuperAdmin/domain/UsersSchema"
import { GetPostsForBlogUseCase } from "./blogs/application/use-cases/blogs/get-posts-for-blog.use-case"
import { GetPostsUseCase } from "./blogs/application/use-cases/posts/get-posts.use-case"
import { GetPostByIdUseCase } from "./blogs/application/use-cases/posts/get-post-by-id.use-case"
import { GetCommentsForPostUseCase } from "./blogs/application/use-cases/posts/get-comments-for-post.use-case"
import { GetCommentByIdUseCase } from "./blogs/application/use-cases/comments/get-comment-by-id.use-case"
import { GetBlogsForSuperAdminUseCase } from "./SuperAdmin/application/use-cases/get-blogs-for-super-admin.use-case"
import { BanBlogUseCase } from "./SuperAdmin/application/use-cases/ban-blog.use-case"
import { UnbanBlogUseCase } from "./SuperAdmin/application/use-cases/unban-blog.use-case"
import { UpdateCommentUseCase } from "./blogs/application/use-cases/comments/update-comment.use-case"
import { GetAllCommentsForBloggerBlogsUseCase } from "./Blogger/application/use-cases/comments/get-all-comments-for-blogger-blogs.use-case"
import { BloggerUsersController } from "./Blogger/api/blogger-users.controller"
import { BanUserForBlogUseCase } from "./Blogger/application/use-cases/users/ban-user-for-blog.use-case"
import { GetAllBannedUsersForBlogUseCase } from "./Blogger/application/use-cases/users/get-all-banned-users-for-blog.use-case"
import { BloggerService } from "./Blogger/application/blogger.service"
import { UnbanUserForBlogUseCase } from "./Blogger/application/use-cases/users/unban-user-for-blog.use-case"
import { AuthRepository } from "./auth/infrastructure/auth-sql-repository"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersSQLRepository } from "./SuperAdmin/infrastructure/users-sql-repository"
import { UsersQuerySQLRepository } from "./SuperAdmin/infrastructure/users-query-sql-repository"
import { DevicesSQLRepository } from "./security/infrastructure/devices-sql-repository"
import { AttemptsSQLRepository } from "./security/infrastructure/attempts-sql-repository"

const authUseCases = [
  LogoutUseCase,
  LoginUseCase,
  ConfirmRecoveryPasswordUseCase,
  SendPasswordRecoveryCodeUseCase,
  ResendConfirmationCodeUseCase,
  ConfirmEmailUseCase,
  CreateUserUseCase,
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
  BanUserUseCase,
  UnbanUserUseCase,
  GetBlogsUseCase,
  GetBlogByIdUseCase,
  GetBlogsForBloggerUseCase,
  GetPostsForBlogUseCase,
  GetPostsUseCase,
  GetPostByIdUseCase,
  GetCommentsForPostUseCase,
  GetCommentByIdUseCase,
  GetBlogsForSuperAdminUseCase,
  BanBlogUseCase,
  UnbanBlogUseCase,
  UpdateCommentUseCase,
  GetAllCommentsForBloggerBlogsUseCase,
  BanUserForBlogUseCase,
  GetAllBannedUsersForBlogUseCase,
  UnbanUserForBlogUseCase,
]

const securityUseCases = [
  RemoveAllSessionsExcludeCurrentUseCase,
  DeleteDeviceUseCase,
  GetActiveDevicesUseCase,
]

const strategies = [
  LocalStrategy,
  BasicStrategy,
]

const services = [
  AppService,
  JwtService,
  BlogsService,
  PostsService,
  CommentsService,
  SecurityService,
  UsersService,
  BloggerService,
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
  AuthRepository,
]

const SQLrepositories = [
  UsersSQLRepository,
  UsersQuerySQLRepository,
  DevicesSQLRepository,
  AttemptsSQLRepository
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

const controllers = [
  AppController,
  SuperAdminUsersController,
  BlogsController,
  PostsController,
  CommentsController,
  AuthController,
  SecurityController,
  BloggerBlogsController,
  SuperAdminBlogsController,
  BloggerUsersController,
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
        name: CommentEntity.name,
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'nodejs',
      password: 'admin:qwerty',
      database: 'BlogsPlatform',
      autoLoadEntities: false,
      synchronize: false,
    }),
    PassportModule,
  ],
  controllers: [...controllers],
  providers: [
    ...strategies,
    ...authUseCases,
    ...blogsUseCases,
    ...securityUseCases,
    ...services,
    ...adapters,
    ...repositories,
    ...SQLrepositories,
    ...decorators,
    ...guards,
    ...configs,
  ],
})

export class AppModule { }