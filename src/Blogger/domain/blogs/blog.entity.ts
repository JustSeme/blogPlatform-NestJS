import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../SuperAdmin/domain/typeORM/user.entity"
import { BansUsersForBlogs } from "./bans-users-for-blogs.entity"
import { PostEntity } from "../posts/post.entity"
import { CommentEntity } from "../../../blogs/domain/comments/typeORM/comment.entity"

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
    @JoinColumn({ name: 'ownerId' })
    user: UserEntity

    @OneToMany(() => BansUsersForBlogs, (ban) => ban.blogId)
    bansForBlog: BansUsersForBlogs[]

    @OneToMany(() => PostEntity, (post) => post.blogId)
    blogPosts: PostEntity[]

    @OneToMany(() => CommentEntity, (comment) => comment.blog)
    blogComments: CommentEntity[]
}