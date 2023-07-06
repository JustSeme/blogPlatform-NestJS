import {
    Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../SuperAdmin/domain/typeORM/user.entity"
import { CommentLikesInfo } from "./comment-likes-info.entity"
import { PostEntity } from "../../../Blogger/domain/posts/typeORM/post.entity"
import { BlogEntity } from "../../../Blogger/domain/blogs/typeORM/blog.entity"

@Entity()
export class CommentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    content: string

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @Column({ default: false })
    isBanned: boolean

    @ManyToOne(() => UserEntity, (user) => user.comments)
    commentator: UserEntity

    @Column()
    commentatorLogin: string

    @OneToMany(() => CommentLikesInfo, (likesInfo) => likesInfo.comment)
    commentLikes: CommentLikesInfo[]

    @ManyToOne(() => PostEntity, (post) => post.comment)
    post: PostEntity

    @Column()
    postTitle: string

    @ManyToOne(() => BlogEntity, (blog) => blog.blogComments)
    blog: BlogEntity

    @Column()
    blogName: string
}