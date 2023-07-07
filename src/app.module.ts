//this line should be the first in app
import { configModule } from "./configuration/configModule"
import {
  ConfigModule, ConfigService
} from "@nestjs/config"
import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import {
  Blog, BlogSchema
} from "./Blogger/domain/blogs/mongoose/BlogsSchema"
import {
  Post, PostSchema
} from "./Blogger/domain/posts/mongoose/PostsSchema"
import { PassportModule } from "@nestjs/passport"
import { AppController } from "./app.controller"
import { BlogsController } from "./blogs/api/blogs-controller"
import { BlogsService } from './blogs/application/blogs-service'
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
import { IsBlogByIdExist } from "./general/decorators/isBlogExists.validation.decorator"
import { IsEmailAlreadyInUse } from "./auth/api/decorators/IsEmailAlreadyInUse"
import { IsLoginAlreadyInUse } from "./auth/api/decorators/IsLoginAlreadyInUse"
import { IsDeviceExistsPipe } from "./security/api/pipes/isDeviceExists.validation.pipe"
import {
  Attempt, AttemptsSchema
} from "./security/domain/mongoose/AttemptsSchema"
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
  Comment, CommentsSchema
} from "./blogs/domain/mongoose/Comments.schema"
import { UsersService } from "./SuperAdmin/application/users.service"
import {
  User, UsersSchema
} from "./SuperAdmin/domain/mongoose/UsersSchema"
import { GetPostsForBlogUseCase } from "./blogs/application/use-cases/blogs/get-posts-for-blog.use-case"
import { GetPostsUseCase } from "./blogs/application/use-cases/posts/get-posts.use-case"
import { GetPostByIdUseCase } from "./blogs/application/use-cases/posts/get-post-by-id.use-case"
import { GetCommentsForPostUseCase } from "./blogs/application/use-cases/posts/get-comments-for-post.use-case"
import { GetCommentByIdUseCase } from "./blogs/application/use-cases/comments/get-comment-by-id.use-case"
import { BanBlogUseCase } from "./SuperAdmin/application/use-cases/ban-blog.use-case"
import { UnbanBlogUseCase } from "./SuperAdmin/application/use-cases/unban-blog.use-case"
import { UpdateCommentUseCase } from "./blogs/application/use-cases/comments/update-comment.use-case"
import { BloggerUsersController } from "./Blogger/api/blogger-users.controller"
import { BanUserForBlogUseCase } from "./Blogger/application/use-cases/users/ban-user-for-blog.use-case"
import { GetAllBannedUsersForBlogUseCase } from "./Blogger/application/use-cases/users/get-all-banned-users-for-blog.use-case"
import { BloggerService } from "./Blogger/application/blogger.service"
import { UnbanUserForBlogUseCase } from "./Blogger/application/use-cases/users/unban-user-for-blog.use-case"
import { AuthRepository } from "./auth/infrastructure/auth-sql-repository"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersSQLRepository } from "./SuperAdmin/infrastructure/rawSQL/users-sql-repository"
import { UsersQuerySQLRepository } from "./SuperAdmin/infrastructure/rawSQL/users-query-sql-repository"
import { DevicesSQLRepository } from "./security/infrastructure/rawSQL/devices-sql-repository"
import { AttemptsSQLRepository } from "./security/infrastructure/rawSQL/attempts-sql-repository"
import { UserEntity } from "./SuperAdmin/domain/typeORM/user.entity"
import { AuthSession } from "./security/domain/typeORM/auth-session.entity"
import { AttemptEntity } from "./security/domain/typeORM/attempt.entity"
import {
  DeviceAuthSession, DeviceAuthSessionsSchema
} from "./security/domain/mongoose/DeviceAuthSessionSchema"
import { BlogsSQLRepository } from "./Blogger/infrastructure/blogs/rawSQL/blogs-sql-repository"
import { BlogsQuerySQLRepository } from "./Blogger/infrastructure/blogs/rawSQL/blogs-query-sql-repository"
import { BansUsersForBlogs } from "./Blogger/domain/blogs/typeORM/bans-users-for-blogs.entity"
import { PostEntity } from "./Blogger/domain/posts/typeORM/post.entity"
import { PostsSQLRepository } from "./Blogger/infrastructure/posts/rawSQL/posts-sql-repository"
import { PostsQuerySQLRepository } from "./Blogger/infrastructure/posts/rawSQL/posts-query-sql-repository"
import { UserBanInfo } from "./SuperAdmin/domain/typeORM/user-ban-info.entity"
import { UserEmailConfirmation } from "./SuperAdmin/domain/typeORM/user-email-confirmation.entity"
import { UserPasswordRecovery } from "./SuperAdmin/domain/typeORM/user-password-recovery.entity"
import { CommentEntity } from "./blogs/domain/typeORM/comment.entity"
import { CommentLikesInfo } from "./blogs/domain/typeORM/comment-likes-info.entity"
import { CommentsSQLRepository } from "./blogs/infrastructure/rawSQL/comments-sql-repository"
import { CommentsQuerySQLRepository } from "./blogs/infrastructure/rawSQL/comments-query-sql-repository"
import { PostLikesInfo } from "./Blogger/domain/posts/typeORM/post-likes-info"
import { UsersTypeORMRepository } from "./SuperAdmin/infrastructure/typeORM/users-typeORM-repository"
import { AuthTypeORMRepository } from "./auth/infrastructure/auth-typeORM-repository"
import { UsersTypeORMQueryRepository } from "./SuperAdmin/infrastructure/typeORM/users-typeORM-query-repository"
import { BlogsQueryTypeORMRepository } from "./Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { BlogsTypeORMRepository } from "./Blogger/infrastructure/blogs/typeORM/blogs-typeORM-repository"
import { CommentsTypeORMRepository } from "./blogs/infrastructure/typeORM/comments-typeORM-repository"
import { PostsQueryTypeORMRepository } from "./Blogger/infrastructure/posts/typeORM/posts-query-typeORM-repository"
import { CommentsQueryTypeORMRepository } from "./blogs/infrastructure/typeORM/comments-query-typeORM-repository"
import { BlogEntity } from "./Blogger/domain/blogs/typeORM/blog.entity"
import { DevicesTypeORMRepository } from "./security/infrastructure/typeORM/devices-typeORM-repository"
import { AttemptsTypeORMRepository } from "./security/infrastructure/typeORM/attempts-typeORM-repository"
import { PostsTypeORMRepository } from "./Blogger/infrastructure/posts/typeORM/posts-typeORM-repository"

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
  GetPostsForBlogUseCase,
  GetPostsUseCase,
  GetPostByIdUseCase,
  GetCommentsForPostUseCase,
  GetCommentByIdUseCase,
  BanBlogUseCase,
  UnbanBlogUseCase,
  UpdateCommentUseCase,
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

// mongoose repositories
const repositories = [
  /* BlogsQueryRepository,
  CommentsQueryRepository,
  UsersQueryRepository,
  UsersRepository,
  PostsRepository,
  BlogsRepository,
  CommentsRepository,
  DeviceRepository,
  AttemptsRepository, */
]

// sql repositories
const SQLrepositories = [
  UsersSQLRepository,
  UsersQuerySQLRepository,
  DevicesSQLRepository,
  AttemptsSQLRepository,
  BlogsSQLRepository,
  BlogsQuerySQLRepository,
  PostsSQLRepository,
  PostsQuerySQLRepository,
  CommentsSQLRepository,
  CommentsQuerySQLRepository,
  AuthRepository,
]

const typeORMRepositories = [
  UsersTypeORMRepository,
  UsersTypeORMQueryRepository,
  AuthTypeORMRepository,
  BlogsTypeORMRepository,
  BlogsQueryTypeORMRepository,
  CommentsTypeORMRepository,
  CommentsQueryTypeORMRepository,
  PostsQueryTypeORMRepository,
  DevicesTypeORMRepository,
  AttemptsTypeORMRepository,
  PostsTypeORMRepository
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

const {
  PGHOST, PGDATABASE, PGUSER, PGPASSWORD
} = process.env

const typeORMEntityes = [
  UserEntity,
  UserBanInfo,
  UserEmailConfirmation,
  UserPasswordRecovery,
  AuthSession,
  AttemptEntity,
  BlogEntity,
  BansUsersForBlogs,
  PostEntity,
  CommentEntity,
  CommentLikesInfo,
  PostLikesInfo,
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}`,
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
      entities: typeORMEntityes
    }),
    TypeOrmModule.forFeature(typeORMEntityes),
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
    ...typeORMRepositories,
    ...decorators,
    ...guards,
    ...configs,
  ],
})

export class AppModule { }

