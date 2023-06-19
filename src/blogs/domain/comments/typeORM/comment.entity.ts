import {
    Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../../SuperAdmin/domain/typeORM/user.entity"
import { CommentLikesInfo } from "./comment-likes-info.entity"
import { PostEntity } from "../../../../Blogger/domain/posts/post.entity"
import { BlogEntity } from "../../../../Blogger/domain/blogs/blog.entity"

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
    @JoinColumn({ name: 'commentatorId' })
    commentatorId: UserEntity

    @Column()
    commentatorLogin: string

    @OneToMany(() => CommentLikesInfo, (likesInfo) => likesInfo.comment)
    commentLikes: CommentLikesInfo[]

    @ManyToOne(() => PostEntity, (post) => post.comment)
    @JoinColumn({ name: 'postId' })
    post: PostEntity

    @Column()
    postTitle: string

    @ManyToOne(() => BlogEntity, (blog) => blog.blogComments)
    @JoinColumn({ name: 'blogId' })
    blog: BlogEntity

    @Column()
    blogName: string
}