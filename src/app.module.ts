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
import { CreateUserUseCase } from "./SuperAdmin/application/use-cases/users/create-user.use-case"
import { RegistrationUserUseCase } from "./auth/application/use-cases/registration-user.use-case"
import { DeleteUserUseCase } from "./SuperAdmin/application/use-cases/users/delete-user.use-case"
import { CqrsModule } from "@nestjs/cqrs"
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
import { BindUserUseCase } from "./SuperAdmin/application/use-cases/users/bind-user.use-case"
import { IsBlogExistOrThrow400Pipe } from "./SuperAdmin/api/pipes/isBlogExistsOrThrow400.validation.pipe"
import { IsUserExistOrThrow400Pipe } from "./SuperAdmin/api/pipes/isUserExistsOrThrow400.validation.pipe"
import { SuperAdminUsersController } from "./SuperAdmin/api/super-admin-users.controller"
import { BanUserUseCase } from "./SuperAdmin/application/use-cases/users/ban-user.use-case"
import { UnbanUserUseCase } from "./SuperAdmin/application/use-cases/users/unban-user.use-case"
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
import { BanBlogUseCase } from "./SuperAdmin/application/use-cases/blogs/ban-blog.use-case"
import { UnbanBlogUseCase } from "./SuperAdmin/application/use-cases/blogs/unban-blog.use-case"
import { UpdateCommentUseCase } from "./blogs/application/use-cases/comments/update-comment.use-case"
import { BloggerUsersController } from "./Blogger/api/blogger-users.controller"
import { BanUserForBlogUseCase } from "./Blogger/application/use-cases/users/ban-user-for-blog.use-case"
import { GetAllBannedUsersForBlogUseCase } from "./Blogger/application/use-cases/users/get-all-banned-users-for-blog.use-case"
import { BloggerService } from "./Blogger/application/blogger.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "./SuperAdmin/domain/typeORM/user.entity"
import { AuthSession } from "./security/domain/typeORM/auth-session.entity"
import { AttemptEntity } from "./security/domain/typeORM/attempt.entity"
import {
  DeviceAuthSession, DeviceAuthSessionsSchema
} from "./security/domain/mongoose/DeviceAuthSessionSchema"
import { BansUsersForBlogs } from "./Blogger/domain/blogs/typeORM/bans-users-for-blogs.entity"
import { PostEntity } from "./Blogger/domain/posts/typeORM/post.entity"
import { UserBanInfo } from "./SuperAdmin/domain/typeORM/user-ban-info.entity"
import { UserEmailConfirmation } from "./SuperAdmin/domain/typeORM/user-email-confirmation.entity"
import { UserPasswordRecovery } from "./SuperAdmin/domain/typeORM/user-password-recovery.entity"
import { CommentEntity } from "./blogs/domain/typeORM/comment.entity"
import { CommentLikesInfo } from "./blogs/domain/typeORM/comment-likes-info.entity"
import { PostLikesInfo } from "./Blogger/domain/posts/typeORM/post-likes-info"
import { UsersTypeORMRepository } from "./SuperAdmin/infrastructure/typeORM/users-typeORM-repository"
import { AuthTypeORMRepository } from "./auth/infrastructure/typeORM/auth-typeORM-repository"
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
import { AuthQueryTypeORMRepository } from "./auth/infrastructure/typeORM/auth-query-typeORM-repository"
import { JwtGetUserId } from "./general/guards/jwt-get-userId.guard"
import { SuperAdminQuizController } from "./SuperAdmin/api/super-admin-quiz.controller"
import { QuizQueryRepository } from "./SuperAdmin/infrastructure/typeORM/quiz-typeORM-query-repository"
import { QuizRepository } from "./SuperAdmin/infrastructure/typeORM/quiz-typeORM-repository"
import { Question } from "./SuperAdmin/domain/typeORM/question.entity"
import { CreateQuestionUseCase } from "./SuperAdmin/application/use-cases/quiz/create-question.use-case"
import { UpdateQuestionUseCase } from "./SuperAdmin/application/use-cases/quiz/update-question.use-case"
import { UpdatePublishQuestionUseCase } from "./SuperAdmin/application/use-cases/quiz/update-publish-question.use-case"
import { DeleteQuestionUseCase } from "./SuperAdmin/application/use-cases/quiz/delete-question.use-case"

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
  BanBlogUseCase,
  UnbanBlogUseCase,
  UpdateCommentUseCase,
  BanUserForBlogUseCase,
  GetAllBannedUsersForBlogUseCase,
]

const securityUseCases = [
  RemoveAllSessionsExcludeCurrentUseCase,
  DeleteDeviceUseCase,
  GetActiveDevicesUseCase,
]

const quizUseCases = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  UpdatePublishQuestionUseCase,
  DeleteQuestionUseCase,
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

// rawSql repositories
const SQLrepositories = [
  /* UsersSQLRepository,
  UsersQuerySQLRepository,
  DevicesSQLRepository,
  AttemptsSQLRepository,
  BlogsSQLRepository,
  BlogsQuerySQLRepository,
  PostsSQLRepository,
  PostsQuerySQLRepository,
  CommentsSQLRepository,
  CommentsQuerySQLRepository,
  AuthRepository, */
]

const typeORMRepositories = [
  UsersTypeORMRepository,
  UsersTypeORMQueryRepository,
  AuthTypeORMRepository,
  AuthQueryTypeORMRepository,
  BlogsTypeORMRepository,
  BlogsQueryTypeORMRepository,
  CommentsTypeORMRepository,
  CommentsQueryTypeORMRepository,
  PostsQueryTypeORMRepository,
  DevicesTypeORMRepository,
  AttemptsTypeORMRepository,
  PostsTypeORMRepository,
  QuizRepository,
  QuizQueryRepository,
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
  JwtGetUserId,
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
  SuperAdminQuizController,
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
  Question,
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
    ...quizUseCases,
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

