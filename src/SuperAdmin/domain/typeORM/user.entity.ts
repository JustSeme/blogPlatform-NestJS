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
import { UserEmailConfitmation } from "./user-email-confirmation.entity"
import { UserPasswordRecovery } from "./user-password-recovery.entity"

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

    @OneToOne(() => UserBanInfo, (banInfo) => banInfo.user)
    banInfo: UserBanInfo

    @OneToOne(() => UserEmailConfitmation, (emailConfirmation) => emailConfirmation.user)
    emailConfirmation: UserEmailConfitmation

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
}