import {
    Column,
    CreateDateColumn,
    Entity, OneToMany, PrimaryGeneratedColumn
} from "typeorm"
import { AuthSession } from "../../security/domain/auth-session.entity"
import { BlogEntity } from "../../Blogger/domain/blogs/blog.entity"
import { BansUsersForBlogs } from "../../Blogger/domain/blogs/bans-users-for-blogs.entity"
import { PostEntity } from "../../Blogger/domain/posts/post.entity"

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    login: string

    @Column()
    email: string

    @CreateDateColumn()
    createdAt: Date

    @Column({ default: false })
    isBanned: boolean

    @Column({ default: null, })
    banReason: string

    @Column({
        type: 'timestamptz',
        default: null,
        nullable: true
    })
    banDate: Date

    @Column()
    passwordHash: string

    @Column({ nullable: true })
    emailConfirmationCode: string

    @Column({ nullable: true })
    emailExpirationDate: Date

    @Column({ default: false })
    isEmailConfirmed: boolean

    @Column({ default: null })
    passwordRecoveryConfirmationCode: string

    @Column({ default: null })
    passwordRecoveryExpirationDate: Date

    @OneToMany(() => AuthSession, (authSession) => authSession.user)
    authSessions: AuthSession[]

    @OneToMany(() => BlogEntity, (blog) => blog.user)
    userBlogs: BlogEntity[]

    @OneToMany(() => BansUsersForBlogs, (ban) => ban.user)
    bansForUser: BansUsersForBlogs[]

    @OneToMany(() => PostEntity, (post) => post.user)
    userPosts: PostEntity[]
}