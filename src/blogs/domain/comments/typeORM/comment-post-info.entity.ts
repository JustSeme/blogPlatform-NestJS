import {
    Column,
    Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn
} from "typeorm"
import { BlogEntity } from "../../../../Blogger/domain/blogs/blog.entity"
import { CommentEntity } from "./comment.entity"

@Entity()
export class CommentPostInfoEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    title: string

    @ManyToOne(() => BlogEntity, (blog) => blog.blogComments)
    @JoinColumn({ name: 'blogId' })
    blog: BlogEntity

    @Column()
    blogName: string

    @OneToOne(() => CommentEntity, (comment) => comment.postInfo)
    @JoinColumn({ name: 'commentId' })
    comment: CommentEntity
}