import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn
} from "typeorm"
import { BansUsersForBlogs } from "./bans-users-for-blogs.entity"
import { UserEntity } from "../../../../SuperAdmin/domain/typeORM/user.entity"
import { PostEntity } from "../../posts/typeORM/post.entity"
import { CommentEntity } from "../../../../blogs/domain/typeORM/comment.entity"

@Entity()
export class BlogEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    websiteUrl: string

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @Column({ default: true })
    isMembership: boolean

    @Column()
    ownerLogin: string

    @Column({ default: false })
    isBanned: boolean

    @Column({ default: null })
    banDate: Date

    @ManyToOne(() => UserEntity, (user) => user.userBlogs)
    @JoinColumn()
    user: UserEntity

    @OneToMany(() => BansUsersForBlogs, (ban) => ban.blog)
    bansForBlog: BansUsersForBlogs[]

    @OneToMany(() => PostEntity, (post) => post.blog)
    blogPosts: PostEntity[]

    @OneToMany(() => CommentEntity, (comment) => comment.post)
    blogComments: CommentEntity[]
}