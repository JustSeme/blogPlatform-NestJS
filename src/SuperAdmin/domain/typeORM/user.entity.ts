import {
    Column,
    CreateDateColumn,
    Entity, OneToMany, OneToOne, PrimaryGeneratedColumn
} from "typeorm"
import { AuthSession } from "../../../security/domain/auth-session.entity"
import { BlogEntity } from "../../../Blogger/domain/blogs/blog.entity"
import { BansUsersForBlogs } from "../../../Blogger/domain/blogs/bans-users-for-blogs.entity"
import { PostEntity } from "../../../Blogger/domain/posts/typeORM/post.entity"
import { UserBanInfo } from "./user-ban-info.entity"
import { UserEmailConfirmation } from "./user-email-confirmation.entity"
import { UserPasswordRecovery } from "./user-password-recovery.entity"
import { CommentEntity } from "../../../blogs/domain/comments/typeORM/comment.entity"
import { CommentLikesInfo } from "../../../blogs/domain/comments/typeORM/comment-likes-info.entity"
import { PostLikesInfo } from "../../../Blogger/domain/posts/typeORM/post-likes-info"

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @Column()
    login: string

    @Column()
    email: string

    @Column()
    passwordHash: string

    @OneToOne(() => UserBanInfo, (banInfo) => banInfo.userId)
    banInfo: UserBanInfo

    @Column({ default: false })
    isBanned: boolean

    @OneToOne(() => UserEmailConfirmation, (emailConfirmation) => emailConfirmation.user)
    emailConfirmation: UserEmailConfirmation

    @Column({ default: false })
    isConfirmed: boolean

    @OneToOne(() => UserPasswordRecovery, (passwordRecovery) => passwordRecovery.user)
    passwordRecovery: UserPasswordRecovery

    @OneToMany(() => AuthSession, (authSession) => authSession.user)
    authSessions: AuthSession[]

    @OneToMany(() => BlogEntity, (blog) => blog.user)
    userBlogs: BlogEntity[]

    @OneToMany(() => BansUsersForBlogs, (ban) => ban.user)
    bansForUser: BansUsersForBlogs[]

    @OneToMany(() => PostEntity, (post) => post.ownerId)
    userPosts: PostEntity[]

    @OneToMany(() => CommentEntity, (comment) => comment.commentator)
    comments: CommentEntity[]

    @OneToMany(() => CommentLikesInfo, (likesInfo) => likesInfo.user)
    commentsLikeEntities: CommentLikesInfo[]

    @OneToMany(() => PostLikesInfo, (like) => like.userId)
    postLikeEntities: PostLikesInfo
}