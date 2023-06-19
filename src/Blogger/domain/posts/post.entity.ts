import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../SuperAdmin/domain/typeORM/user.entity"
import { BlogEntity } from "../blogs/blog.entity"
import { CommentEntity } from "../../../blogs/domain/comments/typeORM/comment.entity"

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
    @JoinColumn({ name: 'blogId' })
    blogId: BlogEntity | string

    @Column()
    blogName: string

    @Column({ default: false })
    isBanned: boolean

    @ManyToOne(() => UserEntity, (user) => user.userPosts)
    @JoinColumn({ name: 'ownerId' })
    ownerId: UserEntity | string

    @Column()
    ownerLogin: string

    @OneToMany(() => CommentEntity, (comment) => comment.postId)
    comment: CommentEntity
}