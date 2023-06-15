import {
    Column,
    CreateDateColumn,
    Entity, OneToMany, OneToOne, PrimaryGeneratedColumn
} from "typeorm"
import { AuthSession } from "../../../security/domain/auth-session.entity"
import { BlogEntity } from "../../../Blogger/domain/blogs/blog.entity"
import { BansUsersForBlogs } from "../../../Blogger/domain/blogs/bans-users-for-blogs.entity"
import { PostEntity } from "../../../Blogger/domain/posts/post.entity"
import { UserBanInfo } from "./user-ban-info.entity"
import { UserEmailConfirmation } from "./user-email-confirmation.entity"
import { UserPasswordRecovery } from "./user-password-recovery.entity"
import { CommentEntity } from "../../../blogs/domain/comments/typeORM/comment.entity"

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @CreateDateColumn()
    createdAt: Date

    @Column()
    login: string

    @Column()
    email: string

    @Column()
    passwordHash: string

    @OneToOne(() => UserBanInfo, (banInfo) => banInfo.user, { cascade: true })
    banInfo: UserBanInfo

    @Column({ default: false })
    isBanned: boolean

    @OneToOne(() => UserEmailConfirmation, (emailConfirmation) => emailConfirmation.user, { cascade: true })
    emailConfirmation: UserEmailConfirmation

    @Column({ default: false })
    isConfirmed: boolean

    @OneToOne(() => UserPasswordRecovery, (passwordRecovery) => passwordRecovery.user, { cascade: true })
    passwordRecovery: UserPasswordRecovery

    @OneToMany(() => AuthSession, (authSession) => authSession.user)
    authSessions: AuthSession[]

    @OneToMany(() => BlogEntity, (blog) => blog.user)
    userBlogs: BlogEntity[]

    @OneToMany(() => BansUsersForBlogs, (ban) => ban.user)
    bansForUser: BansUsersForBlogs[]

    @OneToMany(() => PostEntity, (post) => post.ownerId)
    userPosts: PostEntity[]

    @OneToMany(() => CommentEntity, (comment) => comment.user)
    comments: CommentEntity[]
}