import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../../SuperAdmin/domain/typeORM/user.entity"
import { CommentEntity } from "../../../../blogs/domain/typeORM/comment.entity"
import { PostLikesInfo } from "./post-likes-info"
import { BlogEntity } from "../../blogs/typeORM/blog.entity"

@Entity()
export class PostEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    title: string

    @Column()
    shortDescription: string

    @Column()
    content: string

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @ManyToOne(() => BlogEntity, (blog) => blog.blogPosts)
    @JoinColumn({ name: 'blog' })
    blog: BlogEntity

    @Column()
    blogName: string

    @Column({ default: false })
    isBanned: boolean

    @ManyToOne(() => UserEntity, (user) => user.userPosts)
    owner: UserEntity | string

    @Column()
    ownerLogin: string

    @OneToMany(() => CommentEntity, (comment) => comment.post)
    comments: CommentEntity[]

    @OneToMany(() => PostLikesInfo, (likesInfo) => likesInfo.post)
    postLikeEntities: PostLikesInfo
}